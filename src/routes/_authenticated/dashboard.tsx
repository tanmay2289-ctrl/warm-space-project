import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { supabase } from "@/integrations/supabase/client";
import { getMyProfile, type AnalysisResult } from "@/lib/profile.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Skill Dashboard — SkillSync" },
      {
        name: "description",
        content:
          "See your AI skill profile summary, platform trend scores and personalized job matches on SkillSync.",
      },
      { property: "og:title", content: "Your Skill Dashboard — SkillSync" },
      {
        property: "og:description",
        content: "AI-scored job matches, trend scores and a live summary of your technical profile.",
      },
    ],
  }),
  component: Dashboard,
});

const FALLBACK: AnalysisResult = {
  summary:
    "Run an analysis to let the AI engine turn your interests, focus tags and connected platforms into a live skill profile.",
  skills: [
    { name: "Python", highlight: true },
    { name: "System Design", highlight: true },
    { name: "AWS", highlight: true },
    { name: "React", highlight: false },
    { name: "Docker", highlight: false },
    { name: "PostgreSQL", highlight: false },
  ],
  scores: [
    { label: "GitHub Activity", value: 92 },
    { label: "Resume Match", value: 85 },
    { label: "Interview Readiness", value: 78 },
  ],
  jobs: [
    {
      match: 94,
      title: "Senior Backend Engineer",
      company: "CloudScale Inc.",
      demand: "+15% demand",
      tags: ["Python", "AWS", "Microservices"],
    },
    {
      match: 88,
      title: "Systems Architect",
      company: "Nexus Data Systems",
      demand: "+8% demand",
      tags: ["System Design", "Distributed Systems"],
    },
  ],
};


function MatchRing({ value, dim }: { value: number; dim?: boolean }) {
  return (
    <div
      className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 ${
        dim ? "border-secondary/30" : "border-secondary/50"
      }`}
    >
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36">
        <path
          className="text-surface-variant"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className={dim ? "text-secondary opacity-70" : "text-secondary"}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeDasharray={`${value}, 100`}
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
      <span className="relative z-10 font-mono text-data-point text-secondary">{value}%</span>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [data, setData] = useState<AnalysisResult>(FALLBACK);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMyProfile()
      .then((profile) => {
        if (cancelled) return;
        setName(profile.display_name);
        if (profile.analysis) setData(profile.analysis);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface px-md">
        <div className="flex items-center gap-sm text-on-surface-variant">
          <Icon name="person" />
          <span className="hidden font-mono text-label-caps sm:inline">{name ?? "Signed in"}</span>
        </div>
        <div className="font-display text-headline-md font-bold text-secondary">SkillSync</div>
        <button
          type="button"
          onClick={signOut}
          aria-label="Sign out"
          className="flex items-center gap-xs rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high active:opacity-80"
        >
          <Icon name="logout" />
        </button>
      </header>


      <main className="mx-auto flex w-full max-w-container-max flex-grow flex-col gap-lg px-md py-md pb-32 md:gap-xl md:px-lg md:py-xl">
        <section className="glass-panel flex flex-col gap-md rounded-xl p-md md:p-lg">
          <h2 className="text-headline-xs text-secondary md:text-headline-sm">
            Skill Profile Summary
          </h2>
          <p className="text-body-md text-on-surface-variant">{data.summary}</p>
          <div className="mt-sm flex flex-wrap gap-sm">
            {data.skills.map((s) => (

              <span
                key={s.name}
                className={`rounded-full border bg-surface-container-high px-3 py-1 font-mono text-label-caps text-on-background ${
                  s.highlight ? "border-tertiary/50" : "border-outline-variant"
                }`}
              >
                {s.name}
              </span>

            ))}
          </div>
        </section>

        <section className="flex flex-col gap-sm">
          <h3 className="pl-xs font-mono text-label-caps uppercase tracking-widest text-on-surface-variant">
            Platform Trend Scores
          </h3>
          <div className="hide-scrollbar flex snap-x gap-md overflow-x-auto pb-xs">
            {TREND_SCORES.map((s) => (
              <div
                key={s.label}
                className="glass-panel ai-glow-border flex w-48 shrink-0 snap-start flex-col gap-xs rounded-lg p-md"
              >
                <span className="font-mono text-label-caps text-on-surface-variant">{s.label}</span>
                <div className="flex items-baseline gap-sm">
                  <span className="font-display text-display-lg text-secondary">{s.value}</span>
                  <span className="font-mono text-data-point text-on-surface-variant">%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-md">
          <div className="mb-xs flex flex-col items-start justify-between gap-md md:flex-row md:items-center">
            <h3 className="text-headline-xs text-on-background md:text-headline-sm">
              Personalized Job Matches
            </h3>
            <div className="flex w-full gap-sm md:w-auto">
              {[
                { icon: "sort", label: "Sort" },
                { icon: "filter_list", label: "Filter" },
              ].map((b) => (
                <button
                  key={b.label}
                  type="button"
                  className="glass-panel ai-glow-border flex flex-1 items-center justify-center gap-xs rounded-lg px-4 py-2 font-mono text-label-caps text-on-background md:flex-none"
                >
                  <Icon name={b.icon} className="text-[16px]" /> {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-md">
            {JOBS.map((job) => (
              <div
                key={job.title}
                className="glass-panel ai-glow-border group flex flex-col items-start gap-md rounded-xl p-md md:flex-row md:items-center"
              >
                <MatchRing value={job.match} dim={!job.primary} />
                <div className="flex flex-grow flex-col gap-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-body text-body-lg font-semibold text-on-background">
                        {job.title}
                      </h4>
                      <p className="text-body-sm text-on-surface-variant">{job.company}</p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 rounded bg-tertiary/20 px-2 py-1 font-mono text-label-caps text-tertiary">
                      <Icon name="trending_up" className="text-[14px]" /> {job.demand}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {job.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded border border-outline-variant/50 bg-surface-container-high px-2 py-0.5 font-mono text-label-caps text-on-surface-variant"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  className={`w-full shrink-0 rounded-lg px-6 py-2 font-mono text-label-caps transition-colors focus:opacity-100 group-hover:opacity-100 md:w-auto md:opacity-0 ${
                    job.primary
                      ? "bg-secondary text-on-secondary-container hover:bg-secondary-fixed"
                      : "border border-secondary text-secondary hover:bg-secondary/10"
                  }`}
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <nav className="pb-safe fixed bottom-0 z-50 flex h-20 w-full items-center justify-around rounded-t-xl bg-surface-container-low px-4 shadow-md backdrop-blur-md md:hidden">
        {[
          { icon: "dashboard", label: "Dashboard", active: true },
          { icon: "group", label: "Connections", active: false },
          { icon: "settings", label: "Settings", active: false },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            className={`flex scale-95 flex-col items-center justify-center px-4 py-1 transition-all active:scale-90 ${
              item.active
                ? "rounded-full bg-secondary-container text-on-secondary-container"
                : "text-on-surface-variant opacity-70"
            }`}
          >
            <Icon name={item.icon} className={item.active ? "" : "text-secondary"} />
            <span className="font-mono text-label-caps">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
