import type { ReactNode } from "react";
import Header from "@/components/header";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <main>{children}</main>
    </div>
  );
}
