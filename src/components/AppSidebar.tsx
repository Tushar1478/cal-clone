import { Link, useLocation } from "react-router-dom";
import {
  Clock,
  Link as LinkIcon,
  CalendarDays,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Search,
  ChevronDown,
  Grid3X3,
  Zap,
  Route,
  Users,
  LogOut,
  LayoutGrid,
  CalendarRange,
} from "lucide-react";
import { useState } from "react";
import { getProfile } from "@/lib/store";
import { toast } from "sonner";

const mainNav = [
  { path: "/event-types", label: "Event Types", icon: LinkIcon },
  { path: "/bookings", label: "Bookings", icon: CalendarDays },
  { path: "/availability", label: "Availability", icon: Clock },
  { path: "/teams", label: "Teams", icon: Users },
];

const moreNav = [
  { path: "/apps", label: "Apps", icon: Grid3X3 },
  { path: "/routing", label: "Routing Forms", icon: Route },
  { path: "/workflows", label: "Workflows", icon: Zap },
  { path: "/analytics", label: "Insights", icon: BarChart3 },
];

export default function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const profile = getProfile();

  const copyPublicLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${profile.username}`);
    toast.success("Link copied to clipboard");
  };

  const handleLogout = () => {
    toast.info("Default user — no logout needed");
  };

  const isActive = (path: string) =>
    location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  const navLink = (item: { path: string; label: string; icon: any }) => (
    <Link
      key={item.path}
      to={item.path}
      title={collapsed ? item.label : undefined}
      className={`flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-colors ${
        isActive(item.path)
          ? "bg-sidebar-accent text-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
      } ${collapsed ? "justify-center px-2" : ""}`}
    >
      <item.icon className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-sidebar-border bg-sidebar h-screen fixed left-0 top-0 z-30 transition-all duration-200 ${
        collapsed ? "w-[60px]" : "w-[250px]"
      }`}
    >
      {/* Logo & user */}
      <div className="flex items-center gap-2.5 px-3 pt-4 pb-3">
        <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center flex-shrink-0">
          <CalendarRange className="h-4 w-4 text-background" strokeWidth={2} />
        </div>
        {!collapsed && (
          <div className="flex items-center justify-between flex-1 min-w-0">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-foreground truncate">{profile.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">cal.com/{profile.username}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-1" />
          </div>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/40 px-2.5 py-[6px] text-[13px] text-muted-foreground">
            <Search className="h-3.5 w-3.5" />
            <span>Search...</span>
            <span className="ml-auto text-[10px] border border-sidebar-border rounded px-1 py-0.5">⌘K</span>
          </div>
        </div>
      )}

      {/* Main navigation */}
      <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
        {mainNav.map(navLink)}

        {!collapsed && (
          <div className="pt-4 pb-1 px-2.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              More
            </span>
          </div>
        )}
        {collapsed && <div className="pt-2" />}

        {moreNav.map(navLink)}
      </nav>

      {/* Bottom links */}
      <div className="border-t border-sidebar-border px-2 py-2 space-y-0.5">
        <Link
          to="/public"
          className={`flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground transition-colors ${
            collapsed ? "justify-center px-2" : ""
          }`}
        >
          <ExternalLink className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
          {!collapsed && <span>View public page</span>}
        </Link>
        <button
          onClick={copyPublicLink}
          className={`flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground transition-colors w-full ${
            collapsed ? "justify-center px-2" : ""
          }`}
        >
          <Copy className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
          {!collapsed && <span>Copy public link</span>}
        </button>
        <Link
          to="/settings"
          className={`flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-colors ${
            isActive("/settings")
              ? "bg-sidebar-accent text-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
          } ${collapsed ? "justify-center px-2" : ""}`}
        >
          <Settings className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-destructive transition-colors w-full ${
            collapsed ? "justify-center px-2" : ""
          }`}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center hover:bg-secondary transition-colors z-50"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-muted-foreground" />
        )}
      </button>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-2 border-t border-sidebar-border">
          <p className="text-[10px] text-muted-foreground/40">
            Cal.com Clone · 2026
          </p>
        </div>
      )}
    </aside>
  );
}
