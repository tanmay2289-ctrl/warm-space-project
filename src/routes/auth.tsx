import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Icon } from "@/components/Icon";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to SkillSync" },
      {
        name: "description",
        content:
          "Sign in or create a SkillSync account to save your skill profile and AI-matched jobs.",
      },
      { property: "og:title", content: "Sign in to SkillSync" },
      {
        property: "og:description",
        content: "Access your AI-generated skill profile and personalized job matches.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/onboarding", replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setNotice("Check your email to confirm your account, then sign in.");
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
      navigate({ to: "/onboarding", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setError(null);
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in failed. Please try again.");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/onboarding", replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-md">
      <Link to="/" className="mb-lg flex items-center gap-sm">
        <Icon name="memory" className="text-secondary" />
        <span className="font-display text-headline-md font-bold text-secondary">SkillSync</span>
      </Link>

      <main className="glass-panel relative w-full max-w-md overflow-hidden rounded-xl p-lg">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-secondary opacity-10 blur-[100px]" />

        <h1 className="text-center text-headline-md">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mb-lg mt-sm text-center text-body-sm text-on-surface-variant">
          {mode === "signin"
            ? "Sign in to pick up your skill profile."
            : "Save your profile, platforms and AI job matches."}
        </p>

        <button
          type="button"
          onClick={google}
          disabled={loading}
          className="mb-md flex w-full items-center justify-center gap-sm rounded-lg border border-outline-variant bg-surface-container px-md py-3 font-mono text-data-point text-on-surface transition-colors hover:bg-surface-variant disabled:opacity-60"
        >
          <Icon name="account_circle" />
          Continue with Google
        </button>

        <div className="mb-md flex items-center gap-sm">
          <span className="h-px flex-1 bg-outline-variant" />
          <span className="font-mono text-label-caps text-on-surface-variant">OR</span>
          <span className="h-px flex-1 bg-outline-variant" />
        </div>

        <form onSubmit={submit} className="flex flex-col gap-md">
          <label className="flex flex-col gap-xs">
            <span className="font-mono text-label-caps uppercase text-on-surface-variant">
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-outline-variant bg-surface-container px-md py-sm text-body-md text-on-surface outline-none transition-colors focus:border-secondary"
              placeholder="you@example.com"
            />
          </label>

          <label className="flex flex-col gap-xs">
            <span className="font-mono text-label-caps uppercase text-on-surface-variant">
              Password
            </span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-outline-variant bg-surface-container px-md py-sm text-body-md text-on-surface outline-none transition-colors focus:border-secondary"
              placeholder="••••••••"
            />
          </label>

          {error && <p className="text-body-sm text-error">{error}</p>}
          {notice && <p className="text-body-sm text-tertiary">{notice}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-sm flex items-center justify-center gap-sm rounded-lg bg-secondary px-lg py-3 font-mono text-data-point text-on-secondary shadow-[0_0_15px_color-mix(in_oklab,var(--color-secondary)_30%,transparent)] transition-all active:scale-95 disabled:opacity-60"
          >
            {loading ? "Working..." : mode === "signin" ? "Sign in" : "Create account"}
            <Icon name="arrow_forward" />
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setNotice(null);
          }}
          className="mt-lg w-full text-center text-body-sm text-on-surface-variant transition-colors hover:text-secondary"
        >
          {mode === "signin"
            ? "No account yet? Create one"
            : "Already have an account? Sign in"}
        </button>
      </main>
    </div>
  );
}
