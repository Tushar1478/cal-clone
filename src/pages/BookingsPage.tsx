import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Booking } from "@/lib/types";
import {
  getBookings,
  cancelBooking,
  formatTime,
  formatDateShort,
  formatDateFull,
  rescheduleBooking as rescheduleBookingFn,
  getEventType,
  getAvailableSlots,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  User,
  Mail,
  X,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Video,
  Search,
  CalendarDays,
  CalendarX,
  CalendarCheck,
} from "lucide-react";
import { toast } from "sonner";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleSlots, setRescheduleSlots] = useState<string[]>([]);

  useEffect(() => {
    refreshBookings();
  }, []);

  const refreshBookings = () => {
    const all = getBookings();
    const today = new Date().toISOString().split("T")[0];
    setBookings(
      all.map((b) => {
        if (b.status === "upcoming" && b.date < today) {
          return { ...b, status: "past" as const };
        }
        return b;
      })
    );
  };

  const handleCancelClick = (id: string) => {
    setCancelBookingId(id);
    setCancelReason("");
    setCancelDialogOpen(true);
  };

  const handleCancel = () => {
    if (cancelBookingId) {
      cancelBooking(cancelBookingId, cancelReason || undefined);
      refreshBookings();
      toast.success("Booking cancelled");
    }
    setCancelDialogOpen(false);
    setCancelBookingId(null);
  };

  const openReschedule = (booking: Booking) => {
    setRescheduleTarget(booking);
    setRescheduleDate("");
    setRescheduleTime("");
    setRescheduleSlots([]);
    setRescheduleDialogOpen(true);
  };

  const handleRescheduleDateChange = (date: string) => {
    setRescheduleDate(date);
    setRescheduleTime("");
    if (rescheduleTarget) {
      const et = getEventType(rescheduleTarget.eventTypeId);
      if (et) {
        const slots = getAvailableSlots(date, et.duration, et.bufferBefore, et.bufferAfter, et.minNotice);
        setRescheduleSlots(slots);
      }
    }
  };

  const handleReschedule = () => {
    if (!rescheduleTarget || !rescheduleDate || !rescheduleTime) {
      toast.error("Please select a date and time");
      return;
    }
    const et = getEventType(rescheduleTarget.eventTypeId);
    if (!et) return;

    const startMinutes =
      parseInt(rescheduleTime.split(":")[0]) * 60 +
      parseInt(rescheduleTime.split(":")[1]);
    const endMinutes = startMinutes + et.duration;
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

    rescheduleBookingFn(rescheduleTarget.id, rescheduleDate, rescheduleTime, endTime);
    refreshBookings();
    setRescheduleDialogOpen(false);
    toast.success("Booking rescheduled");
  };

  const toggleExpanded = (id: string) => {
    setExpandedBooking(expandedBooking === id ? null : id);
  };

  const filtered = bookings
    .filter((b) => {
      if (tab === "upcoming") return b.status === "upcoming";
      if (tab === "past") return b.status === "past";
      if (tab === "cancelled") return b.status === "cancelled" || b.status === "rescheduled";
      return true;
    })
    .filter((b) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        b.bookerName.toLowerCase().includes(q) ||
        b.bookerEmail.toLowerCase().includes(q) ||
        b.eventTypeTitle.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (tab === "upcoming") return a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime);
      return b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime);
    });

  const counts = {
    upcoming: bookings.filter((b) => b.status === "upcoming").length,
    past: bookings.filter((b) => b.status === "past").length,
    cancelled: bookings.filter((b) => b.status === "cancelled" || b.status === "rescheduled").length,
  };

  // Group bookings by date
  const grouped: Record<string, Booking[]> = {};
  filtered.forEach((b) => {
    if (!grouped[b.date]) grouped[b.date] = [];
    grouped[b.date].push(b);
  });

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground tracking-tight">Bookings</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          See upcoming and past events booked through your event type links.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <TabsList className="h-9">
            <TabsTrigger value="upcoming" className="gap-1.5 text-[13px]">
              Upcoming
              {counts.upcoming > 0 && (
                <span className="ml-1 text-[11px] bg-foreground/10 rounded-full px-1.5 py-0.5 font-medium">
                  {counts.upcoming}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-1.5 text-[13px]">
              Past
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="gap-1.5 text-[13px]">
              Cancelled
            </TabsTrigger>
          </TabsList>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full sm:w-56 h-9 text-[13px]"
            />
          </div>
        </div>

        <TabsContent value={tab}>
          <div className="rounded-lg border border-border overflow-hidden bg-card">
            {filtered.length === 0 && (
              <div className="px-6 py-20 text-center">
                <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-semibold text-foreground mb-1">
                  No {tab} bookings
                </p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  {tab === "upcoming"
                    ? "When someone books a meeting with you, it will show up here."
                    : tab === "past"
                    ? "Your completed meetings will appear here."
                    : "Cancelled or rescheduled bookings appear here."}
                </p>
              </div>
            )}

            {Object.entries(grouped).map(([date, dateBookings]) => (
              <div key={date}>
                {/* Date header */}
                <div className="px-5 py-2 bg-secondary/30 border-b border-border">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {formatDateFull(date)}
                  </span>
                </div>
                {dateBookings.map((b) => (
                  <div key={b.id} className="border-b border-border last:border-b-0">
                    <div
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-secondary/20 transition-colors cursor-pointer"
                      onClick={() => toggleExpanded(b.id)}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Time column */}
                        <div className="w-28 shrink-0">
                          <p className="text-[13px] font-medium text-foreground">
                            {formatTime(b.startTime)} – {formatTime(b.endTime)}
                          </p>
                        </div>

                        {/* Event info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-[13px] font-semibold text-foreground truncate">
                              {b.eventTypeTitle}
                            </h3>
                            {b.status === "rescheduled" && (
                              <span className="text-[10px] bg-cal-info/10 text-cal-info px-1.5 py-0.5 rounded font-medium">
                                Rescheduled
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              {b.bookerName}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                              <Mail className="h-3 w-3 shrink-0" />
                              {b.bookerEmail}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        {b.status === "upcoming" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="hidden sm:flex gap-1 text-xs h-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                openReschedule(b);
                              }}
                            >
                              <RotateCcw className="h-3 w-3" />
                              Reschedule
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive gap-1 text-xs h-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelClick(b.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                              Cancel
                            </Button>
                          </>
                        )}
                        {b.status === "cancelled" && (
                          <span className="text-[11px] text-destructive font-medium bg-destructive/10 px-2 py-0.5 rounded">
                            Cancelled
                          </span>
                        )}
                        {expandedBooking === b.id ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {expandedBooking === b.id && (
                      <div className="px-5 pb-4 bg-secondary/10 border-t border-border animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                          <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                              Date & Time
                            </p>
                            <p className="text-[13px] text-foreground">
                              {formatDateFull(b.date)}
                            </p>
                            <p className="text-[13px] text-foreground">
                              {formatTime(b.startTime)} – {formatTime(b.endTime)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                              Attendee
                            </p>
                            <p className="text-[13px] text-foreground">{b.bookerName}</p>
                            <p className="text-[13px] text-muted-foreground">
                              {b.bookerEmail}
                            </p>
                          </div>
                          {b.bookerNotes && (
                            <div className="sm:col-span-2">
                              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                Notes
                              </p>
                              <p className="text-[13px] text-foreground bg-background rounded-md p-3 border border-border">
                                {b.bookerNotes}
                              </p>
                            </div>
                          )}
                          {b.customResponses &&
                            Object.keys(b.customResponses).length > 0 && (
                              <div className="sm:col-span-2">
                                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                  Additional Information
                                </p>
                                <div className="space-y-2">
                                  {Object.entries(b.customResponses).map(
                                    ([q, a]) => (
                                      <div
                                        key={q}
                                        className="bg-background rounded-md p-3 border border-border"
                                      >
                                        <p className="text-xs text-muted-foreground">
                                          {q}
                                        </p>
                                        <p className="text-[13px] text-foreground mt-0.5">
                                          {a}
                                        </p>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          {b.cancelReason && (
                            <div className="sm:col-span-2">
                              <p className="text-[11px] font-semibold text-destructive uppercase tracking-wider mb-1">
                                Cancel reason
                              </p>
                              <p className="text-[13px] text-foreground">{b.cancelReason}</p>
                            </div>
                          )}
                          <div className="sm:col-span-2">
                            <p className="text-xs text-muted-foreground">
                              Booked on{" "}
                              {new Date(b.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>

                        {b.status === "upcoming" && (
                          <div className="flex items-center gap-2 pt-2 border-t border-border sm:hidden">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-xs flex-1"
                              onClick={() => openReschedule(b)}
                            >
                              <RotateCcw className="h-3 w-3" />
                              Reschedule
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive gap-1 text-xs flex-1"
                              onClick={() => handleCancelClick(b.id)}
                            >
                              <X className="h-3 w-3" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px]">
              This booking will be cancelled and the attendee will be notified. The time slot will be freed up.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label className="text-[13px]">Reason (optional)</Label>
            <Textarea
              placeholder="Let them know why you're cancelling..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={2}
              className="mt-1.5 text-[13px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base">Reschedule booking</DialogTitle>
            <DialogDescription className="text-[13px]">
              {rescheduleTarget && (
                <>
                  Reschedule <span className="font-medium text-foreground">{rescheduleTarget.bookerName}</span>'s{" "}
                  {rescheduleTarget.eventTypeTitle} booking.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-[13px]">New date</Label>
              <Input
                type="date"
                value={rescheduleDate}
                onChange={(e) => handleRescheduleDateChange(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="mt-1.5 text-[13px]"
              />
            </div>
            {rescheduleDate && (
              <div>
                <Label className="text-[13px]">Available times</Label>
                {rescheduleSlots.length === 0 ? (
                  <p className="text-xs text-muted-foreground mt-2">
                    No available slots on this date.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5 mt-2 max-h-40 overflow-y-auto">
                    {rescheduleSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setRescheduleTime(slot)}
                        className={`py-1.5 px-2 rounded-md text-xs font-medium text-center transition-colors border ${
                          rescheduleTime === slot
                            ? "bg-foreground text-background border-foreground"
                            : "border-border hover:border-foreground/30 text-foreground"
                        }`}
                      >
                        {formatTime(slot)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)} className="text-[13px]">
              Cancel
            </Button>
            <Button onClick={handleReschedule} disabled={!rescheduleDate || !rescheduleTime} className="text-[13px]">
              Reschedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
