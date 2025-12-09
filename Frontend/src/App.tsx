import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AuthLayout from "@/app/pages/auth/layout";

// Pages
import Login from "@/app/pages/auth/login";
import Register from "@/app/pages/auth/register";

/**
 * App Component
 * - Contains all application-level routes
 * - Keeps routing structure centralized
 * - Clean & scalable for future modules (Admin / Users / Dashboard etc.)
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH ROUTES WRAPPED INSIDE AUTH LAYOUT */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* DEFAULT FALLBACK REDIRECT TO LOGIN */}
        <Route path="*" element={<Navigate to="/auth/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
