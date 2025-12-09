import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-200 p-4">
      {/* Outlet shows Login or Register */}
      <Outlet />
    </div>
  );
}