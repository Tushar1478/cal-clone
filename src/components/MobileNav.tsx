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
  ExternalLink,
  Copy,
} from "lucide-react";
import { useState } from "react";
import { getProfile } from "@/lib/store";
import { toast } from "sonner";

const navItems = [
  { path: "/event-types", label: "Event types", icon: LinkIcon },
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
      <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-card">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-[hsl(240,60%,60%)] flex items-center justify-center">
            <span className="text-[11px] font-bold text-white">
              {profile.avatar.charAt(0)}
            </span>
          </div>
          <span className="text-sm font-bold text-foreground">{profile.name}</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="p-1.5 rounded-md hover:bg-secondary transition-colors"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-b border-border bg-card px-3 py-2 animate-fade-in">
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
          <div className="border-t border-border mt-2 pt-2 space-y-0.5">
            <Link
              to="/public"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View public page
            </Link>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/${profile.username}`);
                toast.success("Link copied");
                setOpen(false);
              }}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors w-full"
            >
              <Copy className="h-4 w-4" />
              Copy public page link
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
