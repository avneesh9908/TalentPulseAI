/**
 * @file lib/httpClient.ts
 * @description Centralized HTTP client with interceptors, timeout handling, and error management
 */

import { config } from "./config";
import type { ApiError, ApiErrorResponse, RequestConfig } from "../types/api";

class HttpClient {
  private baseURL: string;
  private defaultTimeout: number;
  private requestInterceptors: ((config: RequestInit) => RequestInit)[] = [];
  private responseInterceptors: ((response: Response) => Response)[] = [];
  private errorInterceptors: ((error: ApiError) => ApiError)[] = [];

  constructor(baseURL: string, timeout: number) {
    this.baseURL = baseURL;
    this.defaultTimeout = timeout;

    // Add default interceptors
    this.addRequestInterceptor(this.injectAuthToken.bind(this));
    this.addErrorInterceptor(this.logError.bind(this));
  }

  /**
   * Add request interceptor (e.g., add auth headers)
   */
  addRequestInterceptor(interceptor: (config: RequestInit) => RequestInit): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor (e.g., handle refresh token)
   */
  addResponseInterceptor(interceptor: (response: Response) => Response): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Add error interceptor (e.g., centralized error handling)
   */
  addErrorInterceptor(interceptor: (error: ApiError) => ApiError): void {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * Inject auth token from localStorage
   */
  private injectAuthToken(requestConfig: RequestInit): RequestInit {
    const token = localStorage.getItem("access_token");
    if (token && requestConfig.headers) {
      const headers = requestConfig.headers as Record<string, string>;
      headers["Authorization"] = `Bearer ${token}`;
    }
    return requestConfig;
  }

  /**
   * Log errors (can be extended for analytics/monitoring)
   */
  private logError(error: ApiError): ApiError {
    console.error(`[API Error] ${error.status}: ${error.detail}`, {
      path: error.path,
      timestamp: error.timestamp,
    });
    return error;
  }

  /**
   * Build request config with headers and timeout
   */
  private buildRequestConfig(
    method: string,
    body?: unknown,
    customConfig?: RequestConfig
  ): RequestInit {
    let config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...customConfig?.headers,
      },
    };

    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      config.body = JSON.stringify(body);
    }

    // Apply request interceptors
    this.requestInterceptors.forEach((interceptor) => {
      config = interceptor(config);
    });

    return config;
  }

  /**
   * Parse error response
   */
  private async parseErrorResponse(response: Response): Promise<ApiError> {
    let detail = `HTTP ${response.status}`;

    try {
      const data: ApiErrorResponse = await response.json();
      if (typeof data.detail === "string") {
        detail = data.detail;
      } else if (Array.isArray(data.detail) && data.detail.length > 0) {
        detail = data.detail[0].msg || detail;
      }
    } catch {
      // If response is not JSON, use default message
    }

    const error: ApiError = {
      status: response.status,
      detail,
      timestamp: new Date().toISOString(),
      path: new URL(response.url).pathname,
    };

    // Apply error interceptors
    this.errorInterceptors.forEach((interceptor) => {
      interceptor(error);
    });

    return error;
  }

  /**
   * Handle response success or error
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // Apply response interceptors
    let processedResponse = response;
    for (const interceptor of this.responseInterceptors) {
      processedResponse = interceptor(processedResponse);
    }

    if (!processedResponse.ok) {
      const error = await this.parseErrorResponse(processedResponse);
      throw error;
    }

    try {
      return await processedResponse.json();
    } catch {
      return null as T;
    }
  }

  /**
   * Execute request with timeout
   */
  private async executeWithTimeout<T>(
    url: string,
    requestConfig: RequestInit,
    timeout: number
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...requestConfig,
        signal: controller.signal,
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        const timeoutError: ApiError = {
          status: 408,
          detail: `Request timeout after ${timeout}ms`,
          timestamp: new Date().toISOString(),
          path: new URL(url).pathname,
        };
        this.errorInterceptors.forEach((interceptor) => interceptor(timeoutError));
        throw timeoutError;
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const requestConfig = this.buildRequestConfig("GET", undefined, config);
    return this.executeWithTimeout<T>(url, requestConfig, config?.timeout || this.defaultTimeout);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const requestConfig = this.buildRequestConfig("POST", data, config);
    return this.executeWithTimeout<T>(url, requestConfig, config?.timeout || this.defaultTimeout);
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const requestConfig = this.buildRequestConfig("PUT", data, config);
    return this.executeWithTimeout<T>(url, requestConfig, config?.timeout || this.defaultTimeout);
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const requestConfig = this.buildRequestConfig("PATCH", data, config);
    return this.executeWithTimeout<T>(url, requestConfig, config?.timeout || this.defaultTimeout);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const requestConfig = this.buildRequestConfig("DELETE", undefined, config);
    return this.executeWithTimeout<T>(url, requestConfig, config?.timeout || this.defaultTimeout);
  }

  /**
   * Get current base URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Update base URL (useful for testing)
   */
  setBaseURL(url: string): void {
    this.baseURL = url;
  }
}

// Export singleton instance
export const httpClient = new HttpClient(config.API_BASE_URL, config.API_TIMEOUT);

// Export class for testing/stubbing
export { HttpClient };
