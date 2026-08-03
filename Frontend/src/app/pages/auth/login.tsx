import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/use-theme";
import { useAuth } from "@/contexts/use-auth";
import { AlertCircle, Loader2, Moon, Sun } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { validateEmail } from "@/lib/validation";
import { Logo } from "@/components/brand/logo";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";

type LoginField = "email" | "password";

export default function Login() {
  const { isDark, toggleTheme } = useTheme();
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
      <div className="mb-6 flex items-center justify-between">
        <a href="/" aria-label="TalentPulseAI home">
          <Logo />
        </a>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun /> : <Moon />}
        </Button>
      </div>

      <Panel tone="raised" padding="lg">
        <h1 className="text-h2 font-semibold text-ink">Welcome back</h1>
        <p className="mt-1.5 text-small text-ink-muted">
          Log in to pick up your interviews and job matches.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2 rounded-md border border-danger/30 bg-danger-soft px-3 py-2.5 text-small text-danger"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* noValidate: the JS validators own the messages */}
        <form onSubmit={handleLogin} noValidate className="mt-6 space-y-4">
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

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-overline uppercase text-ink-subtle">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button type="button" variant="secondary" size="lg" block>
          <FcGoogle size={18} />
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-small text-ink-muted">
          Don't have an account?{" "}
          <Link
            to="/auth/register"
            className="font-medium text-accent-text underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </p>
      </Panel>
    </div>
  );
}
