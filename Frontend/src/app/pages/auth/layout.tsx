import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="
      min-h-screen flex items-center justify-center 
      bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200
      p-4
    ">
      <Outlet />
    </div>
  );
}
