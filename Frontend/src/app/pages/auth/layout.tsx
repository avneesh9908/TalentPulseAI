import { Outlet } from "react-router-dom";

/** Auth pages sit on the phosphor-terminal backdrop (2026-09-24), dark-only. */
export default function AuthLayout() {
  return (
    <div className="ph-grid relative flex min-h-screen items-center justify-center overflow-hidden bg-ph-bg p-4 font-st-body text-ph-ink antialiased">
      <div aria-hidden="true" className="ph-scan pointer-events-none absolute inset-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/4 h-72 w-[30rem] -translate-x-1/2 rounded-full bg-ph-green/[0.08] blur-[130px]"
      />
      <div className="relative z-10 w-full py-10">
        <Outlet />
      </div>
    </div>
  );
}
