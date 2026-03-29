import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import MobileNav from "./MobileNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <MobileNav />
      <main className="md:ml-[240px] transition-all duration-200">
        <div className="max-w-6xl mx-auto px-4 py-4 pb-28 sm:px-6 sm:py-8 sm:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
