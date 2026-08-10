import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { getMyProfile, savePlatforms } from "@/lib/profile.functions";

export const Route = createFileRoute("/_authenticated/connect")({
  head: () => ({
    meta: [
      { title: "Connect Your Platforms — SkillSync" },
      {
        name: "description",
        content:
          "Link GitHub, your resume, LeetCode and portfolio so SkillSync can map your skills and experience.",
      },
      { property: "og:title", content: "Connect Your Platforms — SkillSync" },
      {
        property: "og:description",
        content: "Connect professional profiles to build a comprehensive map of your skills.",
      },
    ],
  }),
  component: ConnectPlatforms,
});

type Status = "connected" | "connecting" | "idle";

const PLATFORMS: {
  name: string;
  icon: string;
  copy: string;
  status: Status;
  recommended?: boolean;
  action?: string;
}[] = [
  {
    name: "GitHub",
    icon: "code",
    copy: "We analyze your READMEs and code contributions to identify technical proficiencies.",
    status: "connected",
    recommended: true,
  },
  {
    name: "Resume PDF",
    icon: "description",
    copy: "Upload your latest resume for deep parsing of your work history and explicit skills.",
    status: "idle",
    recommended: true,
    action: "UPLOAD",
  },
  {
    name: "LeetCode",
    icon: "terminal",
    copy: "Validate problem-solving abilities and algorithmic thinking through your stats.",
    status: "connecting",
  },
  {
    name: "Portfolio",
    icon: "language",
    copy: "Link your personal site for additional project extraction and context.",
    status: "idle",
    action: "CONNECT",
  },
];

function ConnectPlatforms() {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState(PLATFORMS);
  const [saving, setSaving] = useState(false);
  const connectedCount = platforms.filter((p) => p.status === "connected").length;

  useEffect(() => {
    let cancelled = false;
    getMyProfile()
      .then((profile) => {
        const saved = profile.connected_platforms;
        if (cancelled || !saved || !Object.keys(saved).length) return;
        setPlatforms((prev) => prev.map((p) => (saved[p.name] ? { ...p, status: saved[p.name]! } : p)));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const setStatus = (name: string, status: Status) =>
    setPlatforms((prev) => prev.map((p) => (p.name === name ? { ...p, status } : p)));

  const analyze = async () => {
    setSaving(true);
    try {
      await savePlatforms({
        data: {
          platforms: Object.fromEntries(platforms.map((p) => [p.name, p.status])),
        },
      });
    } catch {
      // continue to analysis even if the save fails
    } finally {
      setSaving(false);
      navigate({ to: "/analyzing" });
    }
  };


  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-surface-variant bg-surface/80 px-md backdrop-blur-md">
        <div className="flex items-center gap-sm">
          <Icon name="memory" className="text-secondary" />
          <span className="font-display text-headline-md font-bold text-secondary">SkillSync</span>
        </div>
        <span className="font-mono text-label-caps text-on-surface-variant">STEP 3 OF 4</span>
      </header>

      <main className="mx-auto flex w-full max-w-container-max flex-grow flex-col items-center px-md py-xl md:px-lg">
        <div className="mb-xl w-full max-w-2xl text-center">
          <h1 className="mb-sm text-display-lg">Connect Your Platforms</h1>
          <p className="text-body-lg text-on-surface-variant">
            Connect your professional profiles to let our AI build a comprehensive map of your
            skills and experience.
          </p>
        </div>

        <div className="mb-xl grid w-full max-w-3xl grid-cols-1 gap-md md:grid-cols-2">
          {platforms.map((p) => (
            <div
              key={p.name}
              className={`group relative overflow-hidden rounded-xl border bg-surface-container-low p-md transition-all ${
                p.status === "connected"
                  ? "border-secondary/30 shadow-[0_4px_20px_-5px_color-mix(in_oklab,var(--color-secondary)_15%,transparent)]"
                  : "border-surface-variant hover:border-secondary/50"
              }`}
            >
              {p.recommended && (
                <div
                  className={`absolute right-0 top-0 rounded-bl-lg rounded-tr-xl px-sm py-1 font-mono text-label-caps ${
                    p.status === "connected"
                      ? "bg-secondary text-on-secondary"
                      : "border-b border-l border-secondary/30 bg-secondary/20 text-secondary"
                  }`}
                >
                  RECOMMENDED
                </div>
              )}

              {p.status === "connecting" && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl border border-secondary/20 bg-surface-container-low/60 backdrop-blur-[12px]">
                  <Icon name="refresh" className="mb-2 animate-spin text-secondary" />
                  <span className="font-mono text-label-caps text-secondary">Connecting...</span>
                </div>
              )}

              <div
                className={`relative z-10 mb-md mt-sm flex items-start justify-between ${p.status === "connecting" ? "opacity-50" : ""}`}
              >
                <div className="flex items-center gap-sm">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-surface-container ${
                      p.status === "connected" ? "text-primary" : "text-on-surface-variant"
                    }`}
                  >
                    <Icon name={p.icon} />
                  </div>
                  <h3 className="text-headline-sm">{p.name}</h3>
                </div>
              </div>

              <p
                className={`relative z-10 mb-md text-body-sm text-on-surface-variant ${p.status === "connecting" ? "opacity-50" : ""}`}
              >
                {p.copy}
              </p>

              <div
                className={`relative z-10 mt-auto flex items-center justify-between border-t border-surface-variant pt-sm ${p.status === "connecting" ? "opacity-50" : ""}`}
              >
                {p.status === "connected" ? (
                  <span className="flex items-center gap-2 font-mono text-label-caps text-tertiary">
                    <Icon name="check_circle" className="text-sm" />
                    Connected ✓
                  </span>
                ) : (
                  <span className="font-mono text-label-caps text-on-surface-variant">
                    {p.status === "connecting" ? "Connecting..." : "Not Connected"}
                  </span>
                )}

                {p.status === "connected" && (
                  <button
                    type="button"
                    onClick={() => setStatus(p.name, "idle")}
                    className="font-mono text-label-caps text-on-surface-variant transition-colors hover:text-error"
                  >
                    DISCONNECT
                  </button>
                )}
                {p.status === "idle" && p.action && (
                  <button
                    type="button"
                    onClick={() => setStatus(p.name, "connected")}
                    className={
                      p.recommended
                        ? "rounded border border-secondary/30 bg-secondary/10 px-sm py-2 font-mono text-label-caps text-secondary transition-colors hover:bg-secondary/20"
                        : "rounded border border-surface-variant bg-transparent px-sm py-2 font-mono text-label-caps text-on-surface transition-colors hover:bg-surface-variant"
                    }
                  >
                    {p.action}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className="sticky bottom-0 z-50 flex w-full flex-col items-center justify-between gap-md border-t border-surface-variant bg-surface-container-low p-md backdrop-blur-md md:flex-row md:p-lg">
        <div className="text-center text-body-sm text-on-surface-variant md:text-left">
          {connectedCount} of {platforms.length} platforms connected. More connections yield better
          insights.
        </div>
        <button
          type="button"
          onClick={() => navigate({ to: "/analyzing" })}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-8 py-3 font-display text-headline-sm text-on-secondary shadow-[0_0_15px_color-mix(in_oklab,var(--color-secondary)_40%,transparent)] transition-all hover:scale-[1.02] active:scale-95 md:w-auto"
        >
          <Icon name="analytics" />
          Analyze My Profile
        </button>
      </div>
    </div>
  );
}
