import { Link, useLocation, useNavigate } from "react-router-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Clock,
  Link as LinkIcon,
  CalendarDays,
  Settings,
  BarChart3,
  Search,
  Plus,
  MoreHorizontal,
} from "lucide-react";
import { getProfile } from "@/lib/store";

const navItems = [
  { path: "/event-types", label: "Event types", icon: LinkIcon },
  { path: "/bookings", label: "Bookings", icon: CalendarDays },
  { path: "/availability", label: "Availability", icon: Clock },
  { path: "/analytics", label: "More", icon: MoreHorizontal },
];

export default function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const profile = getProfile();

  const isEventTypes = location.pathname.startsWith("/event-types");

  const openCreate = () => {
    if (isEventTypes) {
      window.dispatchEvent(new Event("cal:create-event-type"));
      return;
    }

    navigate("/event-types");
  };

  return (
    <div className="md:hidden">
      <header className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-3">
        <p className="text-lg font-semibold text-foreground">Cal.com</p>

        <div className="flex items-center gap-3 text-foreground/90">
          <button type="button" className="p-1 transition-colors hover:text-foreground" aria-label="Search">
            <Search className="h-4 w-4" />
          </button>
          <button type="button" className="p-1 transition-colors hover:text-foreground" aria-label="Settings">
            <Settings className="h-4 w-4" />
          </button>
          <div className="h-6 w-6 rounded-full bg-[hsl(240,60%,60%)] flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">{profile.avatar.charAt(0)}</span>
          </div>
        </div>
      </header>

      {isEventTypes && (
        <button
          type="button"
          onClick={openCreate}
          className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-lg shadow-black/30"
          aria-label="New event type"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-sidebar/95 px-2 py-2 backdrop-blur supports-[backdrop-filter]:bg-sidebar/90">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-[11px] font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
