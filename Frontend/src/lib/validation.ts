/**
 * Client-side auth field validators — mirror the backend rules
 * (app/schemas/user_schema.py) so the form catches problems before the
 * request and the messages match what the API would return.
 * Each validator returns an error string, or null when the value is valid.
 */

// Backend: ^[^@\s]+@[^@\s]+\.[^@\s]+$
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
// Backend: ^\+?[0-9][0-9\s\-()]{6,18}$
const PHONE_RE = /^\+?[0-9][0-9\s\-()]{6,18}$/;

export function validateName(value: string): string | null {
  if (!value.trim()) return "Full name is required";
  if (value.trim().length < 2) return "Please enter your full name";
  return null;
}

export function validateEmail(value: string): string | null {
  const v = value.trim();
  if (!v) return "Email is required";
  if (!EMAIL_RE.test(v)) return "Enter a valid email address";
  return null;
}

export function validatePhone(value: string): string | null {
  const v = value.trim();
  if (!v) return "Phone number is required";
  if (!PHONE_RE.test(v)) return "Enter a valid phone number (7–15 digits)";
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return "Password is required";
  if (value.length < 8) return "Password must be at least 8 characters";
  if (value.length > 72) return "Password must be at most 72 characters";
  return null;
}
