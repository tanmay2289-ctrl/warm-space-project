import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AnalysisResult } from "./profile.functions";

export const analyzeProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AnalysisResult> => {
    const apiKey = process.env["GOOGLE_AI_STUDIO_API_KEY"];
    if (!apiKey) throw new Error("GOOGLE_AI_STUDIO_API_KEY is not configured.");

    const { data: profile, error } = await context.supabase
      .from("profiles")
      .select("interests, focus_tags, experience_level, connected_platforms")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);

    const platforms = Object.entries(
      (profile?.connected_platforms as Record<string, string> | null) ?? {},
    )
      .filter(([, status]) => status === "connected")
      .map(([name]) => name);

    const { runGeminiAnalysis } = await import("./gemini.server");
    const result = (await runGeminiAnalysis(apiKey, {
      interests: profile?.interests ?? [],
      focusTags: profile?.focus_tags ?? [],
      level: profile?.experience_level ?? null,
      platforms,
    })) as AnalysisResult;

    const { error: saveError } = await context.supabase.from("profiles").upsert(
      {
        id: context.userId,
        analysis: result,
        analyzed_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (saveError) throw new Error(saveError.message);

    return result;
  });
