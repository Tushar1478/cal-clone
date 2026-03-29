import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import MobileNav from "./MobileNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <MobileNav />
      <main className="md:ml-[250px] transition-all duration-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
