import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AuthLayout from "@/app/pages/auth/layout";

// Pages
import Login from "@/app/pages/auth/login";
import Register from "@/app/pages/auth/register";
import Dashboard from "./app/pages/dashboard/dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH ROUTES */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* DASHBOARD ROUTE */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* DEFAULT FALLBACK */}
        <Route path="*" element={<Navigate to="/auth/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
