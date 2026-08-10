import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { getMyProfile, saveQuestionnaire } from "@/lib/profile.functions";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "SkillSync — Tailor Your Experience" },
      {
        name: "description",
        content:
          "Tell SkillSync about your background so our AI can match you with the right engineering opportunities.",
      },
      { property: "og:title", content: "SkillSync — Tailor Your Experience" },
      {
        property: "og:description",
        content: "Set your fields of interest, focus tags and experience level to get matched.",
      },
    ],
  }),
  component: Questionnaire,
});

const FIELDS = ["Frontend", "Backend", "Mobile", "AI/ML", "DevOps", "Data Science"];

function Questionnaire() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>(["Backend", "AI/ML"]);
  const [tags, setTags] = useState<string[]>(["Remote", "Fintech", "Startup"]);
  const [draft, setDraft] = useState("");
  const [level, setLevel] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMyProfile()
      .then((profile) => {
        if (cancelled) return;
        if (profile.interests.length) setSelected(profile.interests);
        if (profile.focus_tags.length) setTags(profile.focus_tags);
        if (profile.experience_level) setLevel(profile.experience_level);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = (f: string) =>
    setSelected((s) => (s.includes(f) ? s.filter((x) => x !== f) : [...s, f]));

  const next = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveQuestionnaire({ data: { interests: selected, focusTags: tags, level } });
      navigate({ to: "/connect" });
    } catch {
      setError("Could not save your answers. Please try again.");
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-md">
      <main className="glass-panel relative w-full max-w-2xl overflow-hidden rounded-xl p-lg shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5)]">
        <div className="mb-xl flex items-center justify-between">
          <div className="font-mono text-label-caps uppercase text-primary opacity-80">
            Step 1 of 3
          </div>
          <div className="flex h-1 w-32 overflow-hidden rounded-full bg-surface-container">
            <div className="h-full w-1/3 bg-secondary shadow-[0_0_8px_var(--color-secondary)]" />
          </div>
        </div>

        <header className="mb-xl text-center">
          <h1 className="mb-sm text-headline-md">Tailor Your Experience</h1>
          <p className="text-body-md text-on-surface-variant">
            Tell us about your background so we can match you with the right opportunities.
          </p>
        </header>

        <div className="space-y-xl">
          <section>
            <div className="mb-md flex items-center gap-sm">
              <Icon name="code" filled className="text-secondary" />
              <h2 className="text-headline-sm">Fields of Interest</h2>
            </div>
            <div className="flex flex-wrap gap-sm">
              {FIELDS.map((f) => {
                const on = selected.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggle(f)}
                    className={
                      on
                        ? "glow-active rounded-full border border-secondary bg-surface-variant px-md py-sm font-mono text-data-point text-secondary transition-colors active:scale-95"
                        : "rounded-full border border-outline-variant bg-surface-container px-md py-sm font-mono text-data-point text-on-surface transition-colors hover:bg-surface-variant active:scale-95"
                    }
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <div className="mb-md flex items-center gap-sm">
              <Icon name="sell" filled className="text-secondary" />
              <h2 className="text-headline-sm">Custom Focus</h2>
            </div>
            <div className="glass-panel flex w-full flex-wrap gap-sm rounded-lg p-sm transition-colors focus-within:border-secondary">
              {tags.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-xs rounded-full border border-outline-variant bg-surface-container-high px-3 py-1"
                >
                  <span className="font-mono text-data-point text-on-surface">{t}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${t}`}
                    onClick={() => setTags((prev) => prev.filter((x) => x !== t))}
                    className="flex items-center transition-colors hover:text-error"
                  >
                    <Icon name="close" className="text-[16px]" />
                  </button>
                </span>
              ))}
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && draft.trim()) {
                    e.preventDefault();
                    setTags((prev) => [...new Set([...prev, draft.trim()])]);
                    setDraft("");
                  }
                }}
                className="min-w-[150px] flex-grow border-none bg-transparent text-body-sm text-on-surface outline-none placeholder:text-on-surface-variant"
                placeholder="Type and press enter..."
                type="text"
              />
            </div>
          </section>

          <section>
            <div className="mb-md flex items-center gap-sm">
              <Icon name="school" filled className="text-secondary" />
              <h2 className="text-headline-sm">Experience Level</h2>
            </div>
            <div className="relative">
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                aria-label="Experience level"
                className="w-full cursor-pointer appearance-none rounded-lg border border-outline-variant bg-surface-container px-md py-sm text-body-md text-on-surface transition-colors focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
              >
                <option disabled value="">
                  Select your level
                </option>
                <option value="student">Student</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid-Level</option>
                <option value="senior">Senior</option>
              </select>
              <Icon
                name="expand_more"
                className="pointer-events-none absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant"
              />
            </div>
          </section>
        </div>

        <div className="mt-xl flex justify-end border-t border-outline-variant pt-lg">
          <button
            type="button"
            onClick={() => navigate({ to: "/connect" })}
            className="flex items-center gap-sm rounded-lg bg-secondary px-lg py-sm font-mono text-data-point text-on-secondary shadow-[0_0_15px_color-mix(in_oklab,var(--color-secondary)_30%,transparent)] transition-all hover:opacity-90 active:scale-95"
          >
            Next: Connect Platforms
            <Icon name="arrow_forward" />
          </button>
        </div>

        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-secondary opacity-10 blur-[100px]" />
      </main>
    </div>
  );
}
