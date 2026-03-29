import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEventTypes, getProfile } from "@/lib/store";
import { EventType } from "@/lib/types";
import { Clock, ArrowRight, CalendarRange } from "lucide-react";

export default function PublicProfilePage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const profile = getProfile();

  useEffect(() => {
    setEventTypes(getEventTypes().filter((e) => e.isActive));
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Profile header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 rounded-full bg-foreground flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-background">
              {profile.avatar.charAt(0)}
            </span>
          </div>
          <h1 className="text-xl font-bold text-foreground">{profile.name}</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {profile.bio || "Schedule a meeting with me"}
          </p>
        </div>

        {/* Event types */}
        <div className="space-y-2.5">
          {eventTypes.length === 0 && (
            <div className="rounded-lg border border-border bg-card px-6 py-12 text-center">
              <p className="text-[13px] text-muted-foreground">
                No event types available for booking.
              </p>
            </div>
          )}
          {eventTypes.map((et) => (
            <Link
              key={et.id}
              to={`/book/${et.slug}`}
              className="flex items-center rounded-lg border border-border bg-card p-4 hover:border-foreground/20 transition-all group"
            >
              <div
                className="w-1 self-stretch rounded-full mr-4 shrink-0"
                style={{ backgroundColor: et.color }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">
                  {et.title}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {et.duration} min
                  </span>
                </div>
                {et.description && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {et.description}
                  </p>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-3" />
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/40">
            <CalendarRange className="h-3 w-3" />
            <span>Powered by Cal.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
