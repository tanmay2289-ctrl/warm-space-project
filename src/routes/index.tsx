import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Icon } from "@/components/Icon";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkillSync — AI Skill Profiles & Job Matches" },
      {
        name: "description",
        content:
          "SkillSync analyzes your GitHub, resume and portfolio with AI to build a live skill profile and match you with the right engineering roles.",
      },
      { property: "og:title", content: "SkillSync — AI Skill Profiles & Job Matches" },
      {
        property: "og:description",
        content:
          "Connect your platforms, let AI map your skills to market trends and get personalized job matches.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const HIGHLIGHTS = [
  {
    icon: "hub",
    title: "Connect your signals",
    copy: "GitHub, resume, LeetCode and portfolio in one profile.",
  },
  {
    icon: "smart_toy",
    title: "AI skill mapping",
    copy: "Gemini turns your activity into a scored skill profile.",
  },
  {
    icon: "work",
    title: "Matched roles",
    copy: "Personalized job matches ranked against market demand.",
  },
];

function Landing() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-secondary opacity-10 blur-[120px]" />

      <header className="relative z-10 flex h-16 w-full items-center justify-between px-md md:px-lg">
        <div className="flex items-center gap-sm">
          <Icon name="memory" className="text-secondary" />
          <span className="font-display text-headline-md font-bold text-secondary">SkillSync</span>
        </div>
        <Link
          to={signedIn ? "/dashboard" : "/auth"}
          className="rounded-lg border border-outline-variant px-md py-2 font-mono text-label-caps text-on-surface transition-colors hover:border-secondary hover:text-secondary"
        >
          {signedIn ? "DASHBOARD" : "SIGN IN"}
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-container-max flex-grow flex-col items-center justify-center gap-xl px-md py-xl text-center md:px-lg">
        <div className="flex max-w-2xl flex-col items-center gap-md">
          <span className="rounded-full border border-secondary/30 bg-secondary/10 px-md py-1 font-mono text-label-caps text-secondary">
            AI CAREER ENGINE
          </span>
          <h1 className="text-display-lg">Your skills, synced with the market.</h1>
          <p className="text-body-lg text-on-surface-variant">
            SkillSync reads your engineering footprint, scores your strengths and surfaces the roles
            you are actually ready for.
          </p>
          <Link
            to={signedIn ? "/onboarding" : "/auth"}
            className="mt-md flex items-center gap-sm rounded-lg bg-secondary px-lg py-3 font-mono text-data-point text-on-secondary shadow-[0_0_15px_color-mix(in_oklab,var(--color-secondary)_30%,transparent)] transition-all hover:scale-[1.02] active:scale-95"
          >
            {signedIn ? "Continue setup" : "Get started free"}
            <Icon name="arrow_forward" />
          </Link>
        </div>

        <div className="grid w-full max-w-4xl grid-cols-1 gap-md md:grid-cols-3">
          {HIGHLIGHTS.map((h) => (
            <div
              key={h.title}
              className="glass-panel flex flex-col items-start gap-sm rounded-xl p-md text-left"
            >
              <Icon name={h.icon} filled className="text-secondary" />
              <h2 className="text-headline-sm">{h.title}</h2>
              <p className="text-body-sm text-on-surface-variant">{h.copy}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
