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
  ExternalLink,
  Copy,
  Gift,
  Search,
  ChevronDown,
  Grid3X3,
  Zap,
  Route,
  Users,
} from "lucide-react";
import { useState } from "react";
import { getProfile } from "@/lib/store";
import { toast } from "sonner";

const mainNav = [
  { path: "/event-types", label: "Event types", icon: LinkIcon },
  { path: "/bookings", label: "Bookings", icon: CalendarDays },
  { path: "/availability", label: "Availability", icon: Clock },
];

const moreNav = [
  { path: "/analytics", label: "Insights", icon: BarChart3, hasChevron: true },
];

const bottomNav = [
  { path: "/public", label: "View public page", icon: ExternalLink },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const profile = getProfile();

  const copyPublicLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${profile.username}`);
    toast.success("Link copied to clipboard");
  };

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-border bg-sidebar h-screen fixed left-0 top-0 z-30 transition-all duration-200 ${
        collapsed ? "w-[60px]" : "w-[240px]"
      }`}
    >
      {/* User avatar & name */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-border">
        <div className="h-8 w-8 rounded-full bg-[hsl(240,60%,60%)] flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-white">
            {profile.avatar.charAt(0)}
          </span>
        </div>
        {!collapsed && (
          <>
            <span className="text-sm font-semibold text-foreground flex-1 truncate">
              {profile.name}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            <button className="p-1 hover:bg-secondary rounded">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </>
        )}
      </div>

      {/* Main navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {mainNav.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
              } ${collapsed ? "justify-center px-2" : ""}`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {!collapsed && (
          <div className="pt-1 pb-0.5 px-2.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              More
            </span>
          </div>
        )}

        {moreNav.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
              } ${collapsed ? "justify-center px-2" : ""}`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.hasChevron && (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom links */}
      <div className="border-t border-border px-2 py-2 space-y-0.5">
        <Link
          to="/public"
          className={`flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground transition-colors ${
            collapsed ? "justify-center px-2" : ""
          }`}
        >
          <ExternalLink className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>View public page</span>}
        </Link>
        <button
          onClick={copyPublicLink}
          className={`flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground transition-colors w-full ${
            collapsed ? "justify-center px-2" : ""
          }`}
        >
          <Copy className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Copy public page link</span>}
        </button>
        <Link
          to="/settings"
          className={`flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-sm font-medium transition-colors ${
            location.pathname.startsWith("/settings")
              ? "bg-sidebar-accent text-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
          } ${collapsed ? "justify-center px-2" : ""}`}
        >
          <Settings className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-2 border-t border-border">
          <p className="text-[10px] text-muted-foreground/50">
            © 2026 Cal.com, Inc.
          </p>
        </div>
      )}
    </aside>
  );
}
