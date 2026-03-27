import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getBookings, getEventTypes, getBookingStats } from "@/lib/store";
import { Booking, EventType } from "@/lib/types";
import {
  CalendarCheck,
  CalendarX,
  TrendingUp,
  Clock,
  Users,
  BarChart3,
} from "lucide-react";

export default function AnalyticsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);

  useEffect(() => {
    setBookings(getBookings());
    setEventTypes(getEventTypes());
  }, []);

  const stats = getBookingStats();

  // Bookings by event type
  const byEventType = useMemo(() => {
    const counts: Record<string, { title: string; count: number; color: string }> = {};
    bookings.forEach((b) => {
      if (!counts[b.eventTypeId]) {
        const et = eventTypes.find((e) => e.id === b.eventTypeId);
        counts[b.eventTypeId] = {
          title: b.eventTypeTitle,
          count: 0,
          color: et?.color || "#292929",
        };
      }
      counts[b.eventTypeId].count++;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [bookings, eventTypes]);

  // Recent 7 days activity
  const recentDays = useMemo(() => {
    const days: { date: string; label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      const count = bookings.filter(
        (b) => b.createdAt.startsWith(dateStr) || b.date === dateStr
      ).length;
      days.push({ date: dateStr, label, count });
    }
    return days;
  }, [bookings]);

  const maxDayCount = Math.max(...recentDays.map((d) => d.count), 1);

  // Top bookers
  const topBookers = useMemo(() => {
    const counts: Record<string, { name: string; email: string; count: number }> = {};
    bookings
      .filter((b) => b.status !== "cancelled")
      .forEach((b) => {
        if (!counts[b.bookerEmail]) {
          counts[b.bookerEmail] = {
            name: b.bookerName,
            email: b.bookerEmail,
            count: 0,
          };
        }
        counts[b.bookerEmail].count++;
      });
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [bookings]);

  // Total meeting hours
  const totalMinutes = useMemo(() => {
    return bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, b) => {
        const [sh, sm] = b.startTime.split(":").map(Number);
        const [eh, em] = b.endTime.split(":").map(Number);
        return sum + (eh * 60 + em) - (sh * 60 + sm);
      }, 0);
  }, [bookings]);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Insights</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your booking activity and statistics.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={<CalendarCheck className="h-4 w-4" />}
          label="Total Bookings"
          value={stats.total}
          color="text-foreground"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Upcoming"
          value={stats.upcoming}
          color="text-cal-success"
        />
        <StatCard
          icon={<CalendarX className="h-4 w-4" />}
          label="Cancelled"
          value={stats.cancelled}
          color="text-destructive"
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Total Hours"
          value={`${(totalMinutes / 60).toFixed(1)}h`}
          color="text-cal-info"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Activity chart */}
        <div className="cal-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Last 7 Days
          </h3>
          <div className="flex items-end gap-2 h-32">
            {recentDays.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground font-medium">
                  {day.count > 0 ? day.count : ""}
                </span>
                <div
                  className="w-full rounded-t-sm bg-primary/80 transition-all min-h-[4px]"
                  style={{
                    height: `${Math.max((day.count / maxDayCount) * 100, 4)}%`,
                  }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* By event type */}
        <div className="cal-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            By Event Type
          </h3>
          {byEventType.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No data yet
            </p>
          ) : (
            <div className="space-y-3">
              {byEventType.map((et) => (
                <div key={et.title} className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: et.color }}
                  />
                  <span className="text-sm text-foreground flex-1 truncate">
                    {et.title}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {et.count}
                  </span>
                  <div className="w-20 bg-secondary rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(et.count / Math.max(...byEventType.map((e) => e.count))) * 100}%`,
                        backgroundColor: et.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top bookers */}
        <div className="cal-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Frequent Bookers
          </h3>
          {topBookers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No bookings yet
            </p>
          ) : (
            <div className="divide-y divide-border">
              {topBookers.map((booker, i) => (
                <div
                  key={booker.email}
                  className="flex items-center gap-3 py-2.5"
                >
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-foreground">
                      {booker.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {booker.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {booker.email}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {booker.count} booking{booker.count !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="cal-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
