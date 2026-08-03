import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Top-level error boundary. Catches uncaught render errors anywhere in the tree
 * (including providers) and shows a recoverable fallback instead of a blank SPA.
 * Uses window.location for navigation so it works even if the router/providers failed.
 * Tailwind `dark:` variants respond to the `dark` class ThemeProvider sets on <html>.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface for debugging; swap for real telemetry when available.
    console.error("[ErrorBoundary] Uncaught render error:", error, info.componentStack);
  }

  private handleReload = () => window.location.reload();
  private handleHome = () => window.location.assign("/");

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-surface text-ink">
        <div className="max-w-md w-full rounded-2xl border p-8 text-center bg-canvas border-border shadow-e2">
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-sm mb-6 text-ink-muted">
            An unexpected error occurred. You can reload the page or return home.
          </p>
          {import.meta.env.DEV && this.state.error ? (
            <pre className="text-left text-xs mb-6 p-3 rounded-lg overflow-auto max-h-40 bg-surface text-danger">
              {this.state.error.message}
            </pre>
          ) : null}
          <div className="flex gap-3 justify-center">
            <button
              onClick={this.handleReload}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-accent-fg bg-accent hover:bg-accent-hover"
            >
              Reload
            </button>
            <button
              onClick={this.handleHome}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-surface-strong text-ink hover:opacity-90"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
