/**
 * JWT access tokens are kept in the browser (localStorage), not in PostgreSQL.
 * Backends vary on field names — normalize here so login always persists a real token.
 */
export function readAccessTokenFromLoginBody(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;

  const nested =
    d.data && typeof d.data === "object"
      ? (d.data as Record<string, unknown>)
      : null;

  const candidates = [
    d.access_token,
    d.accessToken,
    d.token,
    nested?.access_token,
    nested?.accessToken,
    nested?.token,
  ];

  for (const c of candidates) {
    if (typeof c === "string" && c.length > 0) return c;
  }
  return null;
}
