import { useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { getEventTypes, getProfile } from "@/lib/store";
import { EventType } from "@/lib/types";
import { useState } from "react";
import { Clock, ArrowRight } from "lucide-react";

export default function PublicProfilePage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const profile = getProfile();

  useEffect(() => {
    setEventTypes(getEventTypes().filter((e) => e.isActive));
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        {/* Profile header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 rounded-full bg-[hsl(240,60%,60%)] flex items-center justify-center mb-4 ring-4 ring-[hsl(240,60%,60%)/0.2]">
            <span className="text-2xl font-bold text-white">
              {profile.avatar.charAt(0)}
            </span>
          </div>
          <h1 className="text-xl font-bold text-foreground">{profile.name}</h1>
          <p className="text-sm text-muted-foreground mt-1 italic">
            {profile.bio || "Add your bio here"}
          </p>
        </div>

        {/* Event types list */}
        <div className="cal-card divide-y divide-border overflow-hidden">
          {eventTypes.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No event types available for booking.
              </p>
            </div>
          )}
          {eventTypes.map((et) => (
            <Link
              key={et.id}
              to={`/book/${et.slug}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">
                    {et.title}
                  </h3>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {et.duration} mins
                  </span>
                </div>
                {et.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {et.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-3">
                Book now
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
