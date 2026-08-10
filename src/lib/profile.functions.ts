import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PlatformStatus = "connected" | "connecting" | "idle";

export interface ProfileData {
  display_name: string | null;
  interests: string[];
  focus_tags: string[];
  experience_level: string | null;
  connected_platforms: Record<string, PlatformStatus>;
  analysis: AnalysisResult | null;
  analyzed_at: string | null;
}

export interface AnalysisResult {
  summary: string;
  skills: { name: string; highlight: boolean }[];
  scores: { label: string; value: number }[];
  jobs: {
    match: number;
    title: string;
    company: string;
    demand: string;
    tags: string[];
  }[];
}

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ProfileData> => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select(
        "display_name, interests, focus_tags, experience_level, connected_platforms, analysis, analyzed_at",
      )
      .eq("id", context.userId)
      .maybeSingle();

    if (error) throw new Error(error.message);

    return {
      display_name: data?.display_name ?? null,
      interests: data?.interests ?? [],
      focus_tags: data?.focus_tags ?? [],
      experience_level: data?.experience_level ?? null,
      connected_platforms:
        (data?.connected_platforms as Record<string, PlatformStatus> | null) ?? {},
      analysis: (data?.analysis as AnalysisResult | null) ?? null,
      analyzed_at: data?.analyzed_at ?? null,
    };
  });

export const saveQuestionnaire = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { interests: string[]; focusTags: string[]; level: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").upsert(
      {
        id: context.userId,
        interests: data.interests,
        focus_tags: data.focusTags,
        experience_level: data.level || null,
      },
      { onConflict: "id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const savePlatforms = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { platforms: Record<string, PlatformStatus> }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .upsert({ id: context.userId, connected_platforms: data.platforms }, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
