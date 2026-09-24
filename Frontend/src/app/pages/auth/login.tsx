/*
 * UI: the phosphor-terminal design (2026-09-24) — restyle only; fields,
 * validation and copy are unchanged from
 * docs/backup/login-before-phosphor.tsx.txt. The page is dark-only.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/use-auth";
import { AlertCircle, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { validateEmail } from "@/lib/validation";
import { Button, Field, Panel, TextInput } from "@/components/phos/controls";

type LoginField = "email" | "password";

export default function Login() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<LoginField, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Login only checks presence + basic email shape (never reveals which field
  // is wrong for real credentials — that stays the server's generic 401).
  const validateOne = (field: LoginField) => {
    const msg =
      field === "email" ? validateEmail(email) : password ? null : "Password is required";
    setFieldErrors((prev) => ({ ...prev, [field]: msg ?? undefined }));
    return msg;
  };
  const clearFieldError = (field: LoginField) =>
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");

    const next: Partial<Record<LoginField, string>> = {};
    const emailMsg = validateEmail(email);
    const pwMsg = password ? null : "Password is required";
    if (emailMsg) next.email = emailMsg;
    if (pwMsg) next.password = pwMsg;
    setFieldErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsLoading(true);
    try {
      await login(email, password);
      // Navigation is handled inside auth-context
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[26rem]">
      <div className="mb-8 flex items-center justify-center">
        <a href="/" aria-label="TalentPulseAI home" className="group flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-ph-green shadow-[0_0_10px_#00ff41] transition-transform group-hover:scale-125"
          />
          <span className="font-st-display text-[17px] font-semibold tracking-[-0.01em] text-ph-ink">
            talentpulse<span className="text-ph-green">.ai</span>
          </span>
        </a>
      </div>

      <Panel tone="raised" padding="lg">
        <h1 className="font-st-display text-[26px] font-semibold leading-8 tracking-[-0.02em] text-ph-ink">Welcome back</h1>
        <p className="mt-2 text-[14px] leading-[1.6] text-ph-ink-muted">
          Log in to pick up your interviews and job matches.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-2.5 rounded-[12px] border border-ph-ink/30 bg-ph-ink/[0.06] px-3.5 py-3 text-[13px] text-ph-ink"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-ph-green" />
            {error}
          </div>
        )}

        {/* noValidate: the JS validators own the messages */}
        <form onSubmit={handleLogin} noValidate className="mt-7 space-y-5">
          <Field label="Email address" htmlFor="login-email" error={fieldErrors.email}>
            <TextInput
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
              onBlur={() => validateOne("email")}
              invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
              placeholder="you@example.com"
            />
          </Field>

          <Field label="Password" htmlFor="login-password" error={fieldErrors.password}>
            <TextInput
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
              onBlur={() => validateOne("password")}
              invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
              placeholder="••••••••"
            />
          </Field>

          <Button type="submit" size="lg" block disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Logging in…
              </>
            ) : (
              "Log in"
            )}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-ph-line" />
          <span className="font-ph-mono text-[10px] uppercase tracking-[0.2em] text-ph-ink-soft">or</span>
          <span className="h-px flex-1 bg-ph-line" />
        </div>

        <Button type="button" variant="secondary" size="lg" block>
          <FcGoogle size={18} />
          Continue with Google
        </Button>

        <p className="mt-7 text-center text-[13px] text-ph-ink-soft">
          Don't have an account?{" "}
          <Link to="/auth/register" className="font-medium text-ph-green underline-offset-4 hover:underline">
            Create one
          </Link>
        </p>
      </Panel>
    </div>
  );
}
