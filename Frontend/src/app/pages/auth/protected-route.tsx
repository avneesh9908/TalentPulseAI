import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/use-auth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/auth/login" replace />;
}