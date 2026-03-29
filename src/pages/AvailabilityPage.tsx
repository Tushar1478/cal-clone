import { useState } from "react";
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
  CalendarOff,
  CalendarClock,
  Clock,
  Copy,
  Check,
  MoreHorizontal,
} from "lucide-react";

const TIMEZONES = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Anchorage", "America/Sao_Paulo", "Pacific/Honolulu",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
  "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Asia/Dubai", "Asia/Singapore",
  "Australia/Sydney", "Pacific/Auckland", "Africa/Cairo", "Africa/Johannesburg",
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
          <h1 className="text-xl font-bold text-foreground tracking-tight">Availability</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Configure times when you are available for bookings.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setNewScheduleDialogOpen(true)}
          className="gap-1.5 h-9 text-[13px]"
        >
          <Plus className="h-4 w-4" />
          New schedule
        </Button>
      </div>

      {/* Schedule selector pills */}
      {schedules.length > 1 && (
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
          {schedules.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveScheduleId(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors whitespace-nowrap border ${
                s.id === activeScheduleId
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main schedule editor */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="weekly">
            <TabsList className="mb-4 h-9">
              <TabsTrigger value="weekly" className="gap-1.5 text-[13px]">
                <CalendarClock className="h-3.5 w-3.5" />
                Weekly hours
              </TabsTrigger>
              <TabsTrigger value="overrides" className="gap-1.5 text-[13px]">
                <CalendarOff className="h-3.5 w-3.5" />
                Date overrides
                {activeSchedule.dateOverrides.length > 0 && (
                  <span className="ml-1 text-[10px] bg-foreground text-background rounded-full h-4 min-w-[16px] flex items-center justify-center px-1">
                    {activeSchedule.dateOverrides.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="weekly">
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                {/* Days */}
                <div className="divide-y divide-border">
                  {activeSchedule.days.map((day) => (
                    <div
                      key={day.dayOfWeek}
                      className="flex items-center gap-4 px-5 py-3"
                    >
                      <Switch
                        checked={day.isEnabled}
                        onCheckedChange={(v) =>
                          updateDay(day.dayOfWeek, "isEnabled", v)
                        }
                      />
                      <span
                        className={`w-24 text-[13px] font-medium ${
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
                            className="w-28 text-[13px] h-8"
                          />
                          <span className="text-muted-foreground text-[13px]">–</span>
                          <Input
                            type="time"
                            value={day.endTime}
                            onChange={(e) =>
                              updateDay(day.dayOfWeek, "endTime", e.target.value)
                            }
                            className="w-28 text-[13px] h-8"
                          />
                        </div>
                      ) : (
                        <span className="text-[13px] text-muted-foreground">
                          Unavailable
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer actions */}
                <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-secondary/20">
                  <div className="flex items-center gap-2">
                    {!activeSchedule.isDefault && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={setAsDefault}
                          className="text-xs h-7"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Set as default
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteDialogOpen(true)}
                          className="text-xs text-destructive hover:text-destructive h-7"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                  <Button onClick={handleSave} size="sm" className="h-8 text-[13px]">
                    Save
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="overrides">
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <h3 className="text-[13px] font-semibold text-foreground">
                      Date overrides
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Block specific dates or set custom hours.
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
                    className="gap-1.5 h-8 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </Button>
                </div>

                <div className="divide-y divide-border">
                  {activeSchedule.dateOverrides.length === 0 && (
                    <div className="px-6 py-12 text-center">
                      <CalendarOff className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-[13px] text-muted-foreground">
                        No date overrides yet.
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
                            <p className="text-[13px] font-medium text-foreground">
                              {formatDateShort(override.date)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {override.isBlocked
                                ? "Blocked — unavailable all day"
                                : `Custom: ${override.startTime} – ${override.endTime}`}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
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
        </div>

        {/* Right sidebar - schedule info */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="text-[13px] font-semibold text-foreground mb-3 flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              Timezone
            </h3>
            <Select
              value={activeSchedule.timezone}
              onValueChange={updateTimezone}
            >
              <SelectTrigger className="w-full text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz} className="text-[13px]">
                    {tz.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="text-[13px] font-semibold text-foreground mb-2">
              Schedule details
            </h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Name:</span>{" "}
                {activeSchedule.name}
              </p>
              <p>
                <span className="font-medium text-foreground">Default:</span>{" "}
                {activeSchedule.isDefault ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-medium text-foreground">Active days:</span>{" "}
                {activeSchedule.days.filter((d) => d.isEnabled).length}/7
              </p>
              <p>
                <span className="font-medium text-foreground">Overrides:</span>{" "}
                {activeSchedule.dateOverrides.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Override Dialog */}
      <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base">Add date override</DialogTitle>
            <DialogDescription className="text-[13px]">
              Block a specific date or set custom available hours.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-[13px]">Date</Label>
              <Input
                type="date"
                value={overrideForm.date}
                onChange={(e) =>
                  setOverrideForm({ ...overrideForm, date: e.target.value })
                }
                min={new Date().toISOString().split("T")[0]}
                className="mt-1.5 text-[13px]"
              />
            </div>
            <div>
              <Label className="text-[13px]">Type</Label>
              <Select
                value={overrideForm.isBlocked ? "blocked" : "custom"}
                onValueChange={(v) =>
                  setOverrideForm({
                    ...overrideForm,
                    isBlocked: v === "blocked",
                  })
                }
              >
                <SelectTrigger className="mt-1.5 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blocked">Block entire day</SelectItem>
                  <SelectItem value="custom">Custom hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!overrideForm.isBlocked && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[13px]">Start</Label>
                  <Input
                    type="time"
                    value={overrideForm.startTime}
                    onChange={(e) =>
                      setOverrideForm({
                        ...overrideForm,
                        startTime: e.target.value,
                      })
                    }
                    className="mt-1.5 text-[13px]"
                  />
                </div>
                <div>
                  <Label className="text-[13px]">End</Label>
                  <Input
                    type="time"
                    value={overrideForm.endTime}
                    onChange={(e) =>
                      setOverrideForm({
                        ...overrideForm,
                        endTime: e.target.value,
                      })
                    }
                    className="mt-1.5 text-[13px]"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" onClick={() => setOverrideDialogOpen(false)} className="text-[13px]">
              Cancel
            </Button>
            <Button onClick={handleAddOverride} className="text-[13px]">
              Add override
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Schedule Dialog */}
      <Dialog open={newScheduleDialogOpen} onOpenChange={setNewScheduleDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base">New schedule</DialogTitle>
            <DialogDescription className="text-[13px]">
              Create a new availability schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-2">
            <Label className="text-[13px]">Schedule name</Label>
            <Input
              placeholder="e.g. Evening hours"
              value={newScheduleName}
              onChange={(e) => setNewScheduleName(e.target.value)}
              className="mt-1.5 text-[13px]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" onClick={() => setNewScheduleDialogOpen(false)} className="text-[13px]">
              Cancel
            </Button>
            <Button onClick={handleCreateSchedule} className="text-[13px]">
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Schedule Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this schedule?</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px]">
              This action cannot be undone. Event types using this schedule will fall back to the default.
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
