import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import ErrorBoundary from "@/components/error-boundary";
import { AuthProvider } from "@/contexts/auth-context";
import { InterviewProvider } from "@/contexts/interview-provider";
import { ThemeProvider } from "@/contexts/theme-provider";
import ProtectedRoute from "@/app/pages/auth/protected-route";

// Layouts (structural — kept eager)
import AuthLayout from "@/app/pages/auth/layout";
import ProtectedLayout from "@/app/pages/protected-layout";

// Pages — lazy-loaded so each route ships as its own chunk (code-splitting)
const Login = lazy(() => import("@/app/pages/auth/login"));
const Register = lazy(() => import("@/app/pages/auth/register"));
const Dashboard = lazy(() => import("@/app/pages/dashboard/dashboard"));
const LandingPage = lazy(() => import("@/app/pages/landing"));
const UsersPage = lazy(() => import("@/app/pages/users/users"));
const SelectRole = lazy(() => import("@/app/pages/interview/select-role"));
const SelectProfile = lazy(() => import("@/app/pages/interview/select-profile"));
const QuickSetup = lazy(() => import("@/app/pages/interview/quick-setup"));
const InterviewNow = lazy(() => import("@/app/pages/interview/interview-now"));
const InterviewResult = lazy(() => import("@/app/pages/interview/interview-result"));
const Profile = lazy(() => import("@/app/pages/profile/profile"));

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <Loader2 className="animate-spin text-violet-600" size={28} />
  </div>
);

function App() {
  return (
    // ErrorBoundary is outermost so it also catches provider/router render errors.
    <ErrorBoundary>
    {/* ⚠️ AuthProvider must be INSIDE BrowserRouter (needs useNavigate) */}
    <BrowserRouter>
      <AuthProvider>
        <InterviewProvider>
          <ThemeProvider>
            <Suspense fallback={<PageFallback />}>
            <Routes>
            {/* LANDING PAGE - ENTRY POINT */}
            <Route path="/" element={<LandingPage />} />

            {/* /demo links on landing page redirect to the interview flow */}
            <Route path="/demo" element={<Navigate to="/interview/select-role" replace />} />

            {/* AUTH ROUTES - NOT PROTECTED */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>

            {/* INTERVIEW FLOW - PROTECTED ROUTES */}
            {/* Entry point: Select Role */}
            <Route
              path="/interview"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <SelectRole />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/interview/quick-setup"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <QuickSetup />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/interview/start"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <InterviewNow />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/interview/result"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <InterviewResult />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />

            {/* Flow Step 1: Select Role */}
            <Route
              path="/interview/select-role"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <SelectRole />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />

            {/* Flow Step 2: Select Profile */}
            <Route
              path="/interview/select-profile"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <SelectProfile />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />

            {/* PROTECTED DASHBOARD */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <Dashboard />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <UsersPage />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />
            {/* PROTECTED PROFILE */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <Profile />
                  </ProtectedLayout>
                </ProtectedRoute>
              }
            />

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/auth/login" replace />} />
          </Routes>
            </Suspense>
        </ThemeProvider>
        </InterviewProvider>
      </AuthProvider>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;