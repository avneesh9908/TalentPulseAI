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
 * Styled with the static phosphor tokens: the crash screen must render correctly
 * even when providers failed, so it depends on no theme class or context.
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
      <div className="min-h-screen flex items-center justify-center px-6 bg-ph-bg text-ph-ink font-st-body">
        <div className="max-w-md w-full rounded-[16px] border p-8 text-center bg-ph-surface border-ph-line-strong">
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-sm mb-6 text-ph-ink-muted">
            An unexpected error occurred. You can reload the page or return home.
          </p>
          {import.meta.env.DEV && this.state.error ? (
            <pre className="text-left text-xs mb-6 p-3 rounded-[10px] overflow-auto max-h-40 bg-black border border-ph-line text-ph-ink font-ph-mono">
              {this.state.error.message}
            </pre>
          ) : null}
          <div className="flex gap-3 justify-center">
            <button
              onClick={this.handleReload}
              className="px-5 py-2 rounded-[12px] text-sm font-semibold bg-ph-ink text-black transition-shadow hover:shadow-[0_0_24px_rgba(0,255,65,0.35)]"
            >
              Reload
            </button>
            <button
              onClick={this.handleHome}
              className="px-5 py-2 rounded-[12px] text-sm font-semibold border border-ph-line-strong text-ph-ink transition-colors hover:border-ph-green hover:text-ph-green"
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
