import { Link, useLocation } from "react-router-dom";
import { Calendar, Clock, Link as LinkIcon, CalendarDays, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { path: "/event-types", label: "Event Types", icon: LinkIcon },
  { path: "/bookings", label: "Bookings", icon: CalendarDays },
  { path: "/availability", label: "Availability", icon: Clock },
];

export default function MobileNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-background">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-foreground" />
          <span className="text-base font-bold text-foreground">Cal.com</span>
        </div>
        <button onClick={() => setOpen(!open)} className="p-1.5 rounded-md hover:bg-secondary">
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
        </nav>
      )}
    </div>
  );
}
