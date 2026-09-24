/*
 * UI: the phosphor-terminal design (2026-09-24) — restyle only; fields,
 * validation and copy are unchanged from
 * docs/backup/register-before-phosphor.tsx.txt. The page is dark-only.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/use-auth";
import { AlertCircle, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { validateName, validateEmail, validatePhone, validatePassword } from "@/lib/validation";
import { Button, Field, Panel, TextInput } from "@/components/phos/controls";

type RegisterField = "name" | "email" | "phone" | "password";

export default function Register() {
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<RegisterField, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validators: Record<RegisterField, (v: string) => string | null> = {
    name: validateName,
    email: validateEmail,
    phone: validatePhone,
    password: validatePassword,
  };
  const values: Record<RegisterField, string> = { name, email, phone, password };

  const validateOne = (field: RegisterField) => {
    const msg = validators[field](values[field]);
    setFieldErrors((prev) => ({ ...prev, [field]: msg ?? undefined }));
    return msg;
  };
  // Clear a field's error as the user corrects it.
  const clearFieldError = (field: RegisterField) =>
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const handleRegister = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");

    const next: Partial<Record<RegisterField, string>> = {};
    (Object.keys(validators) as RegisterField[]).forEach((f) => {
      const msg = validators[f](values[f]);
      if (msg) next[f] = msg;
    });
    setFieldErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsLoading(true);
    try {
      await register(name, email, phone, password);
      // Navigation handled inside auth-context
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
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
        <h1 className="font-st-display text-[26px] font-semibold leading-8 tracking-[-0.02em] text-ph-ink">Create your account</h1>
        <p className="mt-2 text-[14px] leading-[1.6] text-ph-ink-muted">
          Free while in beta. One account covers interview practice and job search.
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
        <form onSubmit={handleRegister} noValidate className="mt-7 space-y-5">
          <Field
            label="Full name"
            htmlFor="reg-name"
            error={fieldErrors.name}
            required
          >
            <TextInput
              id="reg-name"
              autoComplete="name"
              value={name}
              onChange={(e) => { setName(e.target.value); clearFieldError("name"); }}
              onBlur={() => validateOne("name")}
              invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "reg-name-error" : undefined}
              placeholder="Your name"
            />
          </Field>

          <Field
            label="Email address"
            htmlFor="reg-email"
            error={fieldErrors.email}
            required
          >
            <TextInput
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
              onBlur={() => validateOne("email")}
              invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "reg-email-error" : undefined}
              placeholder="you@example.com"
            />
          </Field>

          <Field
            label="Phone number"
            htmlFor="reg-phone"
            error={fieldErrors.phone}
            required
          >
            <TextInput
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); clearFieldError("phone"); }}
              onBlur={() => validateOne("phone")}
              invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? "reg-phone-error" : undefined}
              placeholder="+91 98765 43210"
            />
          </Field>

          <Field
            label="Password"
            htmlFor="reg-password"
            error={fieldErrors.password}
            hint="At least 8 characters."
            required
          >
            <TextInput
              id="reg-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
              onBlur={() => validateOne("password")}
              invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "reg-password-error" : undefined}
              placeholder="••••••••"
            />
          </Field>

          <Button type="submit" size="lg" block disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Creating account…
              </>
            ) : (
              "Create account"
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
          Already have an account?{" "}
          <Link to="/auth/login" className="font-medium text-ph-green underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </Panel>
    </div>
  );
}
