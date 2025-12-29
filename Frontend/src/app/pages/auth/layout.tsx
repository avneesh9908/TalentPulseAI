import { Outlet } from "react-router-dom";
import { useTheme } from "@/App";

export default function AuthLayout() {
  const { isDark } = useTheme();
  
  return (
    <div className={`
      min-h-screen flex items-center justify-center 
      transition-colors duration-300 p-4 relative overflow-hidden
      ${isDark 
        ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" 
        : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      }
    `}>
      {/* Animated background elements - same as dashboard */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDark ? "bg-violet-500/10" : "bg-violet-500/5"
        }`}></div>
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDark ? "bg-cyan-500/10" : "bg-cyan-500/5"
        }`} style={{ animationDelay: "1s" }}></div>
      </div>
      
      <div className="relative z-10 w-full">
        <Outlet />
      </div>
    </div>
  );
}