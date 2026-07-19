import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/nexus/auth";
import { ShieldCheck, X, Mail, Lock, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in — NEXUS" },
      { name: "description", content: "Sign in to NEXUS, the AI Intelligence Platform for Data Centre EPC delivery." },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const { user, role, hydrated, signInWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (user && role) navigate({ to: "/app/rfi" });
    else if (user && !role) {
      setLeaving(true);
      const t = setTimeout(() => navigate({ to: "/select-role" }), 480);
      return () => clearTimeout(t);
    }
  }, [hydrated, user, role, navigate]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    setBusy(true);
    try {
      const res = await signInWithEmail(email.trim(), password, isSignUp);
      if (!res.ok) {
        setError(res.reason ?? "Authentication failed");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const res = await signInWithGoogle();
      if (!res.ok) {
        setError(res.reason ?? "Google sign-in failed");
      }
    } finally {
      setBusy(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Initialising session…
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-5">
      {/* Left — facility access panel */}
      <aside className="relative hidden overflow-hidden bg-[oklch(0.16_0.008_260)] text-[oklch(0.985_0.002_90)] lg:col-span-3 lg:block">
        <FacilityBackdrop />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3 animate-nexus-in" style={{ animationDelay: "80ms" }}>
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              N
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight">NEXUS</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                EPC Intelligence Platform
              </div>
            </div>
          </div>

          <div className="max-w-lg space-y-4">
            <div
              className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary animate-nexus-in"
              style={{ animationDelay: "160ms" }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              Facility Access · Tier III/IV
            </div>
            <h2
              className="text-3xl font-semibold leading-tight tracking-tight animate-nexus-in"
              style={{ animationDelay: "220ms" }}
            >
              Two AI agents.<br />
              <span className="text-white/60">One shared knowledge base.</span>
            </h2>
            <p
              className="max-w-md text-sm leading-relaxed text-white/55 animate-nexus-in"
              style={{ animationDelay: "290ms" }}
            >
              Authorized personnel only. All access is firewall-verified, rate-limited, and audited.
            </p>
          </div>

          <div
            className="flex items-center gap-6 text-[10px] uppercase tracking-[0.22em] text-white/40 animate-nexus-in"
            style={{ animationDelay: "360ms" }}
          >
            <span>SEC-01 · Firewall</span>
            <span>SEC-02 · CSRF</span>
            <span>SEC-03 · Rate Limit</span>
            <span>SEC-04 · Audit</span>
          </div>
        </div>
      </aside>

      {/* Right — sign-in card */}
      <section className="relative col-span-1 grid place-items-center px-6 py-12 lg:col-span-2">
        <div
          className={
            "w-full max-w-sm transition-all duration-500 will-change-transform " +
            (leaving ? "translate-y-1 scale-[0.97] opacity-0" : "opacity-100")
          }
          style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-foreground text-background text-sm font-bold">
              N
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight">NEXUS</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                EPC Intelligence Platform
              </div>
            </div>
          </div>

          <div
            className="mb-2 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary animate-nexus-in"
            style={{ animationDelay: "80ms" }}
          >
            <span className="h-px w-6 bg-primary/60" />
            Authorized Personnel
          </div>
          <h1
            className="text-2xl font-semibold tracking-tight animate-nexus-in"
            style={{ animationDelay: "140ms" }}
          >
            {isSignUp ? "Create an account" : "Sign in to continue"}
          </h1>
          <p
            className="mt-2 text-sm text-muted-foreground animate-nexus-in"
            style={{ animationDelay: "200ms" }}
          >
            AI agents for RFI answering and specification compliance, over one shared document
            knowledge base.
          </p>

          {/* Error message */}
          {error && (
            <div
              className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-[11px] leading-relaxed text-red-600 animate-nexus-in"
              style={{ animationDelay: "220ms" }}
            >
              <X className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span className="flex-1">{error}</span>
              <button
                aria-label="Dismiss"
                onClick={() => setError(null)}
                className="text-red-400 transition-colors hover:text-red-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Email/Password form */}
          <form
            onSubmit={handleEmailSignIn}
            className="mt-6 space-y-3 animate-nexus-in"
            style={{ animationDelay: "260ms" }}
          >
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                autoComplete="email"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 disabled:opacity-60"
            >
              {busy ? "Please wait…" : (isSignUp ? "Create account" : "Sign in with email")}
            </button>
          </form>

          {/* Divider */}
          <div
            className="mt-4 flex items-center gap-3 animate-nexus-in"
            style={{ animationDelay: "300ms" }}
          >
            <span className="h-px flex-1 bg-border" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={busy}
            className="group relative mt-4 flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-border bg-card text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-primary hover:shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-primary)_15%,transparent)] disabled:opacity-60 animate-nexus-in"
            style={{
              animationDelay: "320ms",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <GoogleGlyph />
            <span>{busy ? "Signing in…" : "Continue with Google"}</span>
            <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-primary/0 transition-colors group-hover:text-primary">
              →
            </span>
          </button>

          {/* Toggle sign-up / sign-in */}
          <p
            className="mt-4 text-center text-xs text-muted-foreground animate-nexus-in"
            style={{ animationDelay: "340ms" }}
          >
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {isSignUp ? "Sign in" : "Create one"}
            </button>
          </p>

          {showBanner && (
            <div
              className="mt-4 flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/[0.06] p-3 text-[11px] leading-relaxed text-foreground/80 animate-nexus-in"
              style={{ animationDelay: "380ms" }}
            >
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="flex-1">
                <span className="font-medium text-foreground">Firebase Auth active.</span>{" "}
                Email/password and Google sign-in are wired. Roles are stored server-side.
              </span>
              <button
                aria-label="Dismiss"
                onClick={() => setShowBanner(false)}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div
            className="mt-8 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground animate-nexus-in"
            style={{ animationDelay: "420ms" }}
          >
            <span>Session · Firebase Auth</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Systems online
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Abstract blueprint: rack row + UPS/switchgear line-art, softly animated. */
function FacilityBackdrop() {
  return (
    <>
      {/* grid */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.09]"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="nx-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#nx-grid)" />
      </svg>

      {/* copper glow */}
      <div className="absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />

      {/* schematic */}
      <svg
        viewBox="0 0 600 400"
        className="absolute inset-0 h-full w-full text-white/30"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        aria-hidden="true"
      >
        <g className="nx-schematic">
          {/* rack row */}
          {Array.from({ length: 6 }).map((_, i) => (
            <g key={i} transform={`translate(${60 + i * 78}, 220)`}>
              <rect x="0" y="0" width="60" height="130" rx="2" />
              <line x1="0" y1="20" x2="60" y2="20" />
              <line x1="0" y1="40" x2="60" y2="40" />
              <line x1="0" y1="60" x2="60" y2="60" />
              <line x1="0" y1="80" x2="60" y2="80" />
              <line x1="0" y1="100" x2="60" y2="100" />
              <circle cx="8" cy="10" r="1.5" fill="currentColor" className="nx-blink" style={{ animationDelay: `${i * 220}ms` }} />
              <circle cx="14" cy="10" r="1.5" fill="currentColor" opacity="0.4" />
            </g>
          ))}

          {/* UPS block */}
          <g transform="translate(60, 90)" className="nx-fade" style={{ animationDelay: "300ms" }}>
            <rect x="0" y="0" width="130" height="90" rx="3" />
            <text x="10" y="20" fontSize="9" fill="currentColor" stroke="none" letterSpacing="2">UPS-01</text>
            <line x1="10" y1="34" x2="120" y2="34" />
            <line x1="10" y1="50" x2="80" y2="50" />
            <line x1="10" y1="66" x2="100" y2="66" />
            <circle cx="118" cy="78" r="3" />
          </g>

          {/* Switchgear */}
          <g transform="translate(230, 90)" className="nx-fade" style={{ animationDelay: "500ms" }}>
            <rect x="0" y="0" width="150" height="90" rx="3" />
            <text x="10" y="20" fontSize="9" fill="currentColor" stroke="none" letterSpacing="2">SWGR-A</text>
            <line x1="10" y1="34" x2="140" y2="34" />
            <line x1="30" y1="34" x2="30" y2="80" />
            <line x1="60" y1="34" x2="60" y2="80" />
            <line x1="90" y1="34" x2="90" y2="80" />
            <line x1="120" y1="34" x2="120" y2="80" />
            <circle cx="30" cy="80" r="3" />
            <circle cx="60" cy="80" r="3" />
            <circle cx="90" cy="80" r="3" />
            <circle cx="120" cy="80" r="3" />
          </g>

          {/* CRAC */}
          <g transform="translate(420, 90)" className="nx-fade" style={{ animationDelay: "700ms" }}>
            <rect x="0" y="0" width="120" height="90" rx="3" />
            <text x="10" y="20" fontSize="9" fill="currentColor" stroke="none" letterSpacing="2">CRAC-3</text>
            <circle cx="60" cy="55" r="20" />
            <line x1="60" y1="35" x2="60" y2="75" />
            <line x1="40" y1="55" x2="80" y2="55" />
          </g>

          {/* connectors */}
          <path d="M 125 180 L 125 210" strokeDasharray="3 3" className="nx-fade" style={{ animationDelay: "900ms" }} />
          <path d="M 305 180 L 305 210" strokeDasharray="3 3" className="nx-fade" style={{ animationDelay: "1000ms" }} />
          <path d="M 480 180 L 480 210" strokeDasharray="3 3" className="nx-fade" style={{ animationDelay: "1100ms" }} />
        </g>
      </svg>

      {/* scanline */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-full">
        <div className="nx-scan absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      </div>
    </>
  );
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}