/**
 * @file services/authService.ts
 * @description Authentication service - handles login, register, logout, and token management
 */

import { httpClient } from "../lib/httpClient";
import { config, buildUrl } from "../lib/config";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserProfile,
  ApiError,
} from "../types/api";

class AuthService {
  private tokenKey = "access_token";
  private userKey = "current_user";

  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await httpClient.post<AuthResponse>(
        config.ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      
      if (response?.access_token) {
        this.setToken(response.access_token);
        if (response.user) {
          this.setUser(response.user);
        }
      }
      
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.detail || "Login failed");
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await httpClient.post<AuthResponse>(
        config.ENDPOINTS.AUTH.REGISTER,
        data
      );
      
      if (response?.access_token) {
        this.setToken(response.access_token);
        if (response.user) {
          this.setUser(response.user);
        }
      }
      
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.detail || "Registration failed");
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await httpClient.post<AuthResponse>(
        config.ENDPOINTS.AUTH.REFRESH
      );
      
      if (response?.access_token) {
        this.setToken(response.access_token);
      }
      
      return response;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserProfile> {
    try {
      const response = await httpClient.get<UserProfile>(config.ENDPOINTS.AUTH.ME);
      if (response) {
        this.setUser(response);
      }
      return response;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.detail || "Failed to fetch user");
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Try to notify backend of logout
      await httpClient.post(config.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Logout always succeeds locally even if API fails
      console.warn("Logout API call failed, but clearing local session",error);
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Clear all authentication data
   */
  private clearAuth(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  // ============================================
  // TOKEN MANAGEMENT
  // ============================================

  /**
   * Get stored access token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Set access token in storage
   */
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Check if token exists and is valid
   */
  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Basic JWT validation - check expiry
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiryTime = payload.exp * 1000;
      return Date.now() < expiryTime;
    } catch {
      return false;
    }
  }

  /**
   * Get token expiry time
   */
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

  /**
   * Clear token
   */
  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // ============================================
  // USER MANAGEMENT
  // ============================================

  /**
   * Get stored current user
   */
  getCurrentUserFromStorage(): UserProfile | null {
    const userJson = localStorage.getItem(this.userKey);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  /**
   * Set current user in storage
   */
  setUser(user: UserProfile): void { 
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Clear user data
   */
  clearUser(): void {
    localStorage.removeItem(this.userKey);
  }

  // ============================================
  // CONVENIENCE METHODS
  // ============================================

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  /**
   * Get user ID
   */
  getUserId(): string | null {
    return this.getCurrentUserFromStorage()?.id || null;
  }

  /**
   * Get user email
   */
  getUserEmail(): string | null {
    return this.getCurrentUserFromStorage()?.email || null;
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export class for testing
export { AuthService };
