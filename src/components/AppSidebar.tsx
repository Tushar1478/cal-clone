import { Link, useLocation } from "react-router-dom";
import { Calendar, Clock, Link as LinkIcon, Settings, CalendarDays } from "lucide-react";

const navItems = [
  { path: "/event-types", label: "Event Types", icon: LinkIcon },
  { path: "/bookings", label: "Bookings", icon: CalendarDays },
  { path: "/availability", label: "Availability", icon: Clock },
];

export default function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex w-56 flex-col border-r border-border bg-background h-screen fixed left-0 top-0 z-30">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <Calendar className="h-6 w-6 text-foreground" />
        <span className="text-base font-bold tracking-tight text-foreground">Cal.com</span>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
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
      </nav>
      <div className="border-t border-border px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-semibold text-primary-foreground">JD</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">John Doe</span>
            <span className="text-xs text-muted-foreground">john@cal.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
