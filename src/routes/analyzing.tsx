import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

export const Route = createFileRoute("/analyzing")({
  head: () => ({
    meta: [
      { title: "Analyzing Profile — SkillSync" },
      {
        name: "description",
        content:
          "SkillSync's AI core is parsing your repositories, mapping skills to market trends and scoring job matches.",
      },
      { property: "og:title", content: "Analyzing Profile — SkillSync" },
      {
        property: "og:description",
        content: "Live progress while our AI engine synthesizes your skill profile.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Analyzing,
});

const PHASES = [
  { text: "Parsing README & Repositories...", delay: 1000 },
  { text: "Mapping Skills to Market Trends...", delay: 3500 },
  { text: "Scoring Job Matches & Insights...", delay: 6000 },
  { text: "Analysis Complete.", delay: 8500 },
];

function Analyzing() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(-1);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timers = PHASES.map((p, i) =>
      setTimeout(() => {
        setFading(true);
        setTimeout(() => {
          setPhase(i);
          setFading(false);
        }, 300);
      }, p.delay),
    );
    const done = setTimeout(() => navigate({ to: "/dashboard" }), 10500);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [navigate]);

  const statusText = phase < 0 ? "Initializing AI Core..." : PHASES[phase]!.text;
  const complete = phase === 3;
  const logs = [
    { label: "> _Data Ingestion", state: phase >= 0 ? "DONE" : "PENDING", active: true },
    {
      label: "> _Market Mapping",
      state: phase >= 1 ? "DONE" : phase >= 0 ? "ACTIVE" : "WAITING",
      active: phase >= 0,
    },
    {
      label: "> _Synthesis",
      state: phase >= 2 ? "DONE" : phase >= 1 ? "ACTIVE" : "WAITING",
      active: phase >= 1,
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--color-surface-bright),var(--color-background)_60%)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-container-max flex-grow flex-col items-center justify-center p-md md:p-lg">
        <div className="relative flex w-full max-w-2xl flex-col items-center gap-xl">
          <div className="relative flex h-48 w-48 items-center justify-center md:h-64 md:w-64">
            <div className="pulse-orb absolute inset-0 rounded-full bg-secondary opacity-20 blur-2xl" />
            <div className="relative z-10 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-secondary bg-surface-container shadow-[0_0_30px_color-mix(in_oklab,var(--color-secondary)_30%,transparent)] md:h-32 md:w-32">
              <Icon name="smart_toy" filled className="text-display-lg text-secondary" />
            </div>
            <div className="absolute inset-0 animate-[spin_10s_linear_infinite]">
              <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-tertiary shadow-[0_0_10px_color-mix(in_oklab,var(--color-tertiary)_50%,transparent)]" />
            </div>
            <div className="absolute inset-0 animate-[spin_15s_linear_infinite_reverse]">
              <div className="absolute bottom-0 right-1/4 h-3 w-3 rounded-full bg-primary shadow-[0_0_10px_color-mix(in_oklab,var(--color-primary)_50%,transparent)]" />
            </div>
          </div>

          <div className="glass-panel relative flex w-full flex-col items-center gap-md overflow-hidden rounded-xl p-lg">
            <h1 className="mb-sm text-center text-headline-md text-on-surface">Analyzing Profile</h1>

            <div className="flex h-8 w-full items-center justify-center">
              <p
                className={`text-center font-mono text-data-point uppercase tracking-widest transition-opacity duration-300 ${
                  complete ? "text-tertiary" : "text-secondary"
                } ${fading ? "opacity-0" : "opacity-100"}`}
              >
                {statusText}
              </p>
            </div>

            <div className="mt-md flex h-2 w-full gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`relative flex-1 overflow-hidden bg-surface-variant ${
                    i === 0 ? "rounded-l-full" : i === 2 ? "rounded-r-full" : ""
                  }`}
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-secondary transition-[width] duration-500 ease-in-out"
                    style={{ width: phase >= i ? "100%" : "0%" }}
                  />
                </div>
              ))}
            </div>

            <div className="mt-sm flex w-full flex-col gap-2 font-mono text-label-caps text-on-surface-variant opacity-70">
              {logs.map((l) => (
                <div key={l.label} className="flex w-full items-center justify-between">
                  <span>{l.label}</span>
                  <span className={l.active ? "text-tertiary" : ""}>{l.state}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
