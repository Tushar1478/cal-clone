import { Link, useLocation } from "react-router-dom";
import {
  Calendar,
  Clock,
  Link as LinkIcon,
  CalendarDays,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { getProfile } from "@/lib/store";

const navItems = [
  { path: "/event-types", label: "Event Types", icon: LinkIcon },
  { path: "/bookings", label: "Bookings", icon: CalendarDays },
  { path: "/availability", label: "Availability", icon: Clock },
  { path: "/analytics", label: "Insights", icon: BarChart3 },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const profile = getProfile();

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-border bg-background h-screen fixed left-0 top-0 z-30 transition-all duration-200 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center flex-shrink-0">
            <Calendar className="h-4 w-4 text-background" />
          </div>
          {!collapsed && (
            <span className="text-base font-bold tracking-tight text-foreground whitespace-nowrap">
              Cal.com
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              } ${collapsed ? "justify-center px-2" : ""}`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-2 mb-2 flex items-center justify-center rounded-md border border-border py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* User info */}
      <div className="border-t border-border px-3 py-3">
        <Link to="/settings" className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-secondary transition-colors">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-primary-foreground">
              {profile.avatar}
            </span>
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-foreground truncate">
                {profile.name}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {profile.email}
              </span>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}
