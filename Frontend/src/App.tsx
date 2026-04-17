import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth-context";
import { InterviewProvider } from "@/contexts/interview-provider";
import { ThemeProvider } from "@/contexts/theme-provider";
import ProtectedRoute from "@/app/pages/auth/protected-route";

// Layouts
import AuthLayout from "@/app/pages/auth/layout";
import ProtectedLayout from "@/app/pages/protected-layout";

// Pages
import Login from "@/app/pages/auth/login";
import Register from "@/app/pages/auth/register";
import Dashboard from "@/app/pages/dashboard/dashboard";
import LandingPage from "@/app/pages/landing";
import UserProfile from "./app/pages/userProfile"; 
import UsersPage from "@/app/pages/users/users";

// Interview Pages
import SelectRole from "@/app/pages/interview/select-role";
import SelectProfile from "@/app/pages/interview/select-profile";
import QuickSetup from "@/app/pages/interview/quick-setup";
import InterviewNow from "@/app/pages/interview/interview-now";
import Profile from "@/app/pages/profile/profile";
// import InterviewSession from "@/app/pages/interview/session";
// import InterviewResult from "@/app/pages/interview/result";

function App() {
  return (
    // ⚠️ AuthProvider must be INSIDE BrowserRouter (needs useNavigate)
    <BrowserRouter>
      <AuthProvider>
        <InterviewProvider>
          <ThemeProvider>
            <Routes>
            {/* LANDING PAGE - ENTRY POINT */}
            <Route path="/" element={<LandingPage />} />

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
                  <UserProfile />   {/* ← capital U */}
                </ProtectedRoute>
              }
            />


            <Route
              // path="/interview/session"
              // element={
              //   <ProtectedRoute>
              //     <InterviewSession />
              //   </ProtectedRoute>
              // }
            />

            <Route
              // path="/interview/result"
              // element={
              //   <ProtectedRoute>
              //     <InterviewResult />
              //   </ProtectedRoute>
              // }
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
        </ThemeProvider>
        </InterviewProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;