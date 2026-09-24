import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/use-auth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ph-bg">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-ph-green motion-reduce:animate-none" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/auth/login" replace />;
}