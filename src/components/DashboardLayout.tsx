import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import MobileNav from "./MobileNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cal-subtle">
      <AppSidebar />
      <MobileNav />
      <main className="md:ml-56">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
