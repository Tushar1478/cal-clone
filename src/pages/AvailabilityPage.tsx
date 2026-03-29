import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  AvailabilitySchedule,
  DAYS_OF_WEEK,
  DateOverride,
} from "@/lib/types";
import {
  getAvailabilitySchedules,
  saveAvailability,
  addDateOverride,
  removeDateOverride,
  deleteAvailabilitySchedule,
  formatDateShort,
} from "@/lib/store";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Globe,
  Plus,
  Trash2,
  Copy,
  CalendarOff,
  CalendarClock,
  Clock,
} from "lucide-react";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "America/Sao_Paulo",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Australia/Sydney",
  "Pacific/Auckland",
  "Africa/Cairo",
  "Africa/Johannesburg",
];

export default function AvailabilityPage() {
  const [schedules, setSchedules] = useState<AvailabilitySchedule[]>(
    getAvailabilitySchedules()
  );
  const [activeScheduleId, setActiveScheduleId] = useState<string>(
    schedules[0]?.id || ""
  );
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    date: "",
    isBlocked: true,
    startTime: "09:00",
    endTime: "17:00",
  });
  const [newScheduleDialogOpen, setNewScheduleDialogOpen] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const refresh = () => {
    const s = getAvailabilitySchedules();
    setSchedules(s);
  };

  const activeSchedule = schedules.find((s) => s.id === activeScheduleId);

  const updateDay = (
    dayOfWeek: number,
    field: string,
    value: string | boolean
  ) => {
    if (!activeSchedule) return;
    const updated = {
      ...activeSchedule,
      days: activeSchedule.days.map((d) =>
        d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d
      ),
    };
    saveAvailability(updated);
    refresh();
  };

  const handleSave = () => {
    if (!activeSchedule) return;
    saveAvailability(activeSchedule);
    toast.success("Availability saved");
  };

  const updateTimezone = (tz: string) => {
    if (!activeSchedule) return;
    saveAvailability({ ...activeSchedule, timezone: tz });
    refresh();
  };

  const handleAddOverride = () => {
    if (!overrideForm.date || !activeSchedule) {
      toast.error("Please select a date");
      return;
    }
    const override: DateOverride = {
      id: crypto.randomUUID(),
      date: overrideForm.date,
      isBlocked: overrideForm.isBlocked,
      startTime: overrideForm.isBlocked ? undefined : overrideForm.startTime,
      endTime: overrideForm.isBlocked ? undefined : overrideForm.endTime,
    };
    addDateOverride(activeSchedule.id, override);
    refresh();
    setOverrideDialogOpen(false);
    toast.success(
      overrideForm.isBlocked
        ? "Date blocked"
        : "Custom hours set for this date"
    );
  };

  const handleRemoveOverride = (overrideId: string) => {
    if (!activeSchedule) return;
    removeDateOverride(activeSchedule.id, overrideId);
    refresh();
    toast.success("Date override removed");
  };

  const handleCreateSchedule = () => {
    if (!newScheduleName.trim()) {
      toast.error("Please enter a schedule name");
      return;
    }
    const newSchedule: AvailabilitySchedule = {
      id: crypto.randomUUID(),
      name: newScheduleName,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isDefault: false,
      days: Array.from({ length: 7 }, (_, i) => ({
        id: crypto.randomUUID(),
        dayOfWeek: i,
        startTime: "09:00",
        endTime: "17:00",
        isEnabled: i >= 1 && i <= 5,
      })),
      dateOverrides: [],
    };
    saveAvailability(newSchedule);
    refresh();
    setActiveScheduleId(newSchedule.id);
    setNewScheduleDialogOpen(false);
    setNewScheduleName("");
    toast.success("New schedule created");
  };

  const handleDeleteSchedule = () => {
    if (!activeSchedule || activeSchedule.isDefault) return;
    deleteAvailabilitySchedule(activeSchedule.id);
    const remaining = getAvailabilitySchedules();
    setActiveScheduleId(remaining[0]?.id || "");
    refresh();
    setDeleteDialogOpen(false);
    toast.success("Schedule deleted");
  };

  const setAsDefault = () => {
    if (!activeSchedule) return;
    const updated = schedules.map((s) => ({
      ...s,
      isDefault: s.id === activeSchedule.id,
    }));
    updated.forEach((s) => saveAvailability(s));
    refresh();
    toast.success("Set as default schedule");
  };

  if (!activeSchedule) return null;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Availability</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure times when you are available for bookings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNewScheduleDialogOpen(true)}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            New schedule
          </Button>
        </div>
      </div>

      {/* Schedule selector */}
      {schedules.length > 1 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          {schedules.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveScheduleId(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                s.id === activeScheduleId
                  ? "bg-foreground text-background"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock className="h-3 w-3" />
              {s.name}
              {s.isDefault && (
                <span className="text-[10px] opacity-60">(default)</span>
              )}
            </button>
          ))}
        </div>
      )}

      <Tabs defaultValue="weekly">
        <TabsList className="mb-4">
          <TabsTrigger value="weekly" className="gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" />
            Weekly hours
          </TabsTrigger>
          <TabsTrigger value="overrides" className="gap-1.5">
            <CalendarOff className="h-3.5 w-3.5" />
            Date overrides
            {activeSchedule.dateOverrides.length > 0 && (
              <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full h-4 w-4 flex items-center justify-center">
                {activeSchedule.dateOverrides.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weekly">
          <div className="cal-card">
            {/* Timezone */}
            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Timezone</Label>
              </div>
              <Select
                value={activeSchedule.timezone}
                onValueChange={updateTimezone}
              >
                <SelectTrigger className="w-full max-w-sm">
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

            {/* Days */}
            <div className="divide-y divide-border">
              {activeSchedule.days.map((day) => (
                <div
                  key={day.dayOfWeek}
                  className="flex items-center gap-4 px-5 py-3.5"
                >
                  <Switch
                    checked={day.isEnabled}
                    onCheckedChange={(v) =>
                      updateDay(day.dayOfWeek, "isEnabled", v)
                    }
                  />
                  <span
                    className={`w-28 text-sm font-medium ${
                      day.isEnabled
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {DAYS_OF_WEEK[day.dayOfWeek]}
                  </span>
                  {day.isEnabled ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={day.startTime}
                        onChange={(e) =>
                          updateDay(day.dayOfWeek, "startTime", e.target.value)
                        }
                        className="w-28 text-sm"
                      />
                      <span className="text-muted-foreground text-sm">–</span>
                      <Input
                        type="time"
                        value={day.endTime}
                        onChange={(e) =>
                          updateDay(day.dayOfWeek, "endTime", e.target.value)
                        }
                        className="w-28 text-sm"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">
                      Unavailable
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="px-5 py-3 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!activeSchedule.isDefault && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={setAsDefault}
                      className="text-xs"
                    >
                      Set as default
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteDialogOpen(true)}
                      className="text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
              <Button onClick={handleSave} size="sm">
                Save
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="overrides">
          <div className="cal-card">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Date overrides
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Block specific dates or set custom hours that override your
                  weekly schedule.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setOverrideForm({
                    date: "",
                    isBlocked: true,
                    startTime: "09:00",
                    endTime: "17:00",
                  });
                  setOverrideDialogOpen(true);
                }}
                className="gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add override
              </Button>
            </div>

            <div className="divide-y divide-border">
              {activeSchedule.dateOverrides.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <CalendarOff className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No date overrides yet.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add overrides to block specific dates or set custom hours.
                  </p>
                </div>
              )}
              {activeSchedule.dateOverrides
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((override) => (
                  <div
                    key={override.id}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          override.isBlocked
                            ? "bg-destructive"
                            : "bg-cal-success"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {formatDateShort(override.date)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {override.isBlocked
                            ? "Blocked — no bookings"
                            : `Custom: ${override.startTime} – ${override.endTime}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveOverride(override.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Override Dialog */}
      <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add date override</DialogTitle>
            <DialogDescription>
              Block a specific date or set custom available hours.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={overrideForm.date}
                onChange={(e) =>
                  setOverrideForm({ ...overrideForm, date: e.target.value })
                }
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={overrideForm.isBlocked ? "blocked" : "custom"}
                onValueChange={(v) =>
                  setOverrideForm({
                    ...overrideForm,
                    isBlocked: v === "blocked",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blocked">
                    Block entire day
                  </SelectItem>
                  <SelectItem value="custom">
                    Set custom hours
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!overrideForm.isBlocked && (
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label>Start</Label>
                  <Input
                    type="time"
                    value={overrideForm.startTime}
                    onChange={(e) =>
                      setOverrideForm({
                        ...overrideForm,
                        startTime: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex-1">
                  <Label>End</Label>
                  <Input
                    type="time"
                    value={overrideForm.endTime}
                    onChange={(e) =>
                      setOverrideForm({
                        ...overrideForm,
                        endTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setOverrideDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddOverride}>Add override</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Schedule Dialog */}
      <Dialog
        open={newScheduleDialogOpen}
        onOpenChange={setNewScheduleDialogOpen}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New availability schedule</DialogTitle>
            <DialogDescription>
              Create a new schedule with different hours.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Schedule name</Label>
              <Input
                placeholder="e.g. Evening Hours"
                value={newScheduleName}
                onChange={(e) => setNewScheduleName(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setNewScheduleDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateSchedule}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Schedule Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete schedule?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{activeSchedule.name}". This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSchedule}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
