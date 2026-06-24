/**
 * @file services/authService.ts
 * @description Client-side auth token/user storage helpers (localStorage).
 * Network auth calls live in `api/authService.ts`; the login/register flow is
 * driven by `contexts/auth-context.tsx`.
 */

import type { UserProfile } from "../types/api";

class AuthService {
  private tokenKey = "access_token";
  private userKey = "current_user";

  // ============================================
  // TOKEN MANAGEMENT
  // ============================================

  /** Get stored access token. */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey) ?? localStorage.getItem("token");
  }

  /** Set access token in storage. */
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /** Check if a token exists and has not expired. */
  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiryTime = payload.exp * 1000;
      return Date.now() < expiryTime;
    } catch {
      return false;
    }
  }

  /** Get token expiry time, or null if absent/unparseable. */
  getTokenExpiry(): Date | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return new Date(payload.exp * 1000);
    } catch {
      return null;
    }
  }

  /** Remove access token and cached user (logout / session reset). */
  clearClientSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem("token");
    localStorage.removeItem(this.userKey);
  }

  // ============================================
  // USER MANAGEMENT
  // ============================================

  /** Get stored current user. */
  getCurrentUserFromStorage(): UserProfile | null {
    const userJson = localStorage.getItem(this.userKey);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  /** Set current user in storage. */
  setUser(user: UserProfile): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // ============================================
  // CONVENIENCE
  // ============================================

  /** Check if the user is authenticated (has a non-expired token). */
  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  /** Get user email from cached profile. */
  getUserEmail(): string | null {
    return this.getCurrentUserFromStorage()?.email || null;
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export class for testing
export { AuthService };
