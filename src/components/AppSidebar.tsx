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
  Search,
  ChevronDown,
  Grid3X3,
  Zap,
  Route,
  Users,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { getProfile } from "@/lib/store";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const profile = getProfile();

  const copyPublicLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${profile.username}`);
    toast.success("Link copied to clipboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("cal-clone-auth");
    toast.success("Signed out");
    navigate("/login");
  };

  const isActive = (path: string) =>
    location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  const navLink = (item: { path: string; label: string; icon: any }) => (
    <Link
      key={item.path}
      to={item.path}
      title={collapsed ? item.label : undefined}
      className={`flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-sm font-medium transition-colors ${
        isActive(item.path)
          ? "bg-sidebar-accent text-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
      } ${collapsed ? "justify-center px-2" : ""}`}
    >
      <item.icon className="h-4 w-4 flex-shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );

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
        {mainNav.map(navLink)}

        {!collapsed && (
          <div className="pt-3 pb-0.5 px-2.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              More
            </span>
          </div>
        )}
        {collapsed && <div className="pt-2" />}

        {moreNav.map(navLink)}
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
          {!collapsed && <span>Copy public link</span>}
        </button>
        <Link
          to="/settings"
          className={`flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-sm font-medium transition-colors ${
            isActive("/settings")
              ? "bg-sidebar-accent text-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
          } ${collapsed ? "justify-center px-2" : ""}`}
        >
          <Settings className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-destructive transition-colors w-full ${
            collapsed ? "justify-center px-2" : ""
          }`}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-sidebar border border-border flex items-center justify-center hover:bg-secondary transition-colors z-50"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-muted-foreground" />
        )}
      </button>

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
