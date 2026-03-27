import { Link, useLocation } from "react-router-dom";
import {
  Calendar,
  Clock,
  Link as LinkIcon,
  CalendarDays,
  Settings,
  BarChart3,
  Menu,
  X,
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

export default function MobileNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const profile = getProfile();

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-background">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-foreground flex items-center justify-center">
            <Calendar className="h-3.5 w-3.5 text-background" />
          </div>
          <span className="text-base font-bold text-foreground">Cal.com</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="p-1.5 rounded-md hover:bg-secondary"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-b border-border bg-background px-3 py-2 animate-fade-in">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <div className="border-t border-border mt-2 pt-2 px-3 pb-1">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                <span className="text-[10px] font-semibold text-primary-foreground">
                  {profile.avatar}
                </span>
              </div>
              <span className="text-sm text-foreground">{profile.name}</span>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
