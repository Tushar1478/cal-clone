import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AvailabilitySchedule, DAYS_OF_WEEK } from "@/lib/types";
import { getAvailability, saveAvailability } from "@/lib/store";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Globe } from "lucide-react";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Australia/Sydney",
  "Pacific/Auckland",
];

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState<AvailabilitySchedule>(getAvailability());

  const updateDay = (dayOfWeek: number, field: string, value: string | boolean) => {
    setSchedule((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d
      ),
    }));
  };

  const handleSave = () => {
    saveAvailability(schedule);
    toast.success("Availability saved");
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Availability</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure times when you are available for bookings.
          </p>
        </div>
        <Button onClick={handleSave} size="sm">
          Save
        </Button>
      </div>

      <div className="cal-card">
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Timezone</Label>
          </div>
          <Select
            value={schedule.timezone}
            onValueChange={(v) => setSchedule({ ...schedule, timezone: v })}
          >
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="divide-y divide-border">
          {schedule.days.map((day) => (
            <div
              key={day.dayOfWeek}
              className="flex items-center gap-4 px-5 py-3.5"
            >
              <Switch
                checked={day.isEnabled}
                onCheckedChange={(v) => updateDay(day.dayOfWeek, "isEnabled", v)}
              />
              <span
                className={`w-24 text-sm font-medium ${
                  day.isEnabled ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {DAYS_OF_WEEK[day.dayOfWeek]}
              </span>
              {day.isEnabled ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={day.startTime}
                    onChange={(e) => updateDay(day.dayOfWeek, "startTime", e.target.value)}
                    className="w-32 text-sm"
                  />
                  <span className="text-muted-foreground text-sm">-</span>
                  <Input
                    type="time"
                    value={day.endTime}
                    onChange={(e) => updateDay(day.dayOfWeek, "endTime", e.target.value)}
                    className="w-32 text-sm"
                  />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Unavailable</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
