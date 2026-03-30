import { NavLink } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  Clock,
  Globe,
  Link as LinkIcon,
  LogOut,
  Route as RouteIcon,
  Settings,
  Users,
  Workflow,
  AppWindow,
} from "lucide-react";
import { toast } from "sonner";
import { getProfile } from "@/lib/store";
import { cn } from "@/lib/utils";

type NavItem = {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { path: "/event-types", label: "Event types", icon: LinkIcon },
  { path: "/bookings", label: "Bookings", icon: CalendarDays },
  { path: "/availability", label: "Availability", icon: Clock },
  { path: "/teams", label: "Teams", icon: Users },
  { path: "/apps", label: "Apps", icon: AppWindow },
  { path: "/routing", label: "Routing", icon: RouteIcon },
  { path: "/workflows", label: "Workflows", icon: Workflow },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function AppSidebar() {
  const profile = getProfile();

  const handleLogout = () => {
    toast.info("Default user mode — no login/logout required");
  };

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-[240px] flex-col border-r border-border bg-sidebar md:flex">
      <div className="border-b border-border px-4 py-4">
        <p className="text-lg font-semibold text-sidebar-foreground">Cal.com</p>
      </div>

      <div className="flex items-center gap-3 border-b border-border px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground font-semibold">
          {profile.avatar?.charAt(0) || "U"}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-sidebar-foreground">{profile.name}</p>
          <p className="truncate text-xs text-sidebar-foreground/70">{profile.email}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-border p-2">
        <NavLink
          to="/public"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            )
          }
        >
          <Globe className="h-4 w-4" />
          <span>Public page</span>
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
