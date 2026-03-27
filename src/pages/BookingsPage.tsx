import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Booking } from "@/lib/types";
import {
  getBookings,
  cancelBooking,
  formatTime,
  formatDateShort,
  formatDateFull,
  rescheduleBooking,
  getEventType,
  getAvailableSlots,
  getAvailability,
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
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Video,
  FileText,
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

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  // Reschedule state
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [rescheduleBooking, setRescheduleBookingState] = useState<Booking | null>(null);
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
    setRescheduleBookingState(booking);
    setRescheduleDate("");
    setRescheduleTime("");
    setRescheduleSlots([]);
    setRescheduleDialogOpen(true);
  };

  const handleRescheduleDateChange = (date: string) => {
    setRescheduleDate(date);
    setRescheduleTime("");
    if (rescheduleBooking) {
      const et = getEventType(rescheduleBooking.eventTypeId);
      if (et) {
        const slots = getAvailableSlots(date, et.duration, et.bufferBefore, et.bufferAfter, et.minNotice);
        setRescheduleSlots(slots);
      }
    }
  };

  const handleReschedule = () => {
    if (!rescheduleBooking || !rescheduleDate || !rescheduleTime) {
      toast.error("Please select a date and time");
      return;
    }
    const et = getEventType(rescheduleBooking.eventTypeId);
    if (!et) return;

    const startMinutes =
      parseInt(rescheduleTime.split(":")[0]) * 60 +
      parseInt(rescheduleTime.split(":")[1]);
    const endMinutes = startMinutes + et.duration;
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

    rescheduleBooking(rescheduleBooking.id, rescheduleDate, rescheduleTime, endTime);
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

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          See upcoming and past events booked through your event type links.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <TabsList>
            <TabsTrigger value="upcoming" className="gap-1.5">
              <CalendarCheck className="h-3.5 w-3.5" />
              Upcoming
              {counts.upcoming > 0 && (
                <span className="ml-1 text-xs bg-foreground/10 rounded-full px-1.5">
                  {counts.upcoming}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Past
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="gap-1.5">
              <CalendarX className="h-3.5 w-3.5" />
              Cancelled
            </TabsTrigger>
          </TabsList>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full sm:w-56 h-9 text-sm"
            />
          </div>
        </div>

        <TabsContent value={tab}>
          <div className="cal-card overflow-hidden divide-y divide-border">
            {filtered.length === 0 && (
              <div className="px-6 py-16 text-center">
                <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground mb-1">
                  No {tab} bookings
                </p>
                <p className="text-xs text-muted-foreground">
                  {tab === "upcoming"
                    ? "When someone books a meeting with you, it will show up here."
                    : tab === "past"
                    ? "Your completed meetings will appear here."
                    : "Cancelled or rescheduled bookings appear here."}
                </p>
              </div>
            )}
            {filtered.map((b) => (
              <div key={b.id}>
                <div
                  className="flex items-start sm:items-center justify-between px-5 py-4 hover:bg-cal-subtle transition-colors cursor-pointer"
                  onClick={() => toggleExpanded(b.id)}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        {b.eventTypeTitle}
                      </h3>
                      {b.status === "rescheduled" && (
                        <span className="text-[10px] bg-cal-info/10 text-cal-info px-1.5 py-0.5 rounded font-medium">
                          Rescheduled
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDateShort(b.date)}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTime(b.startTime)} – {formatTime(b.endTime)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        {b.bookerName}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {b.bookerEmail}
                      </span>
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
                      <span className="text-xs text-destructive font-medium">
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
                  <div className="px-5 pb-4 bg-cal-subtle/50 border-t border-border animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                          Date & Time
                        </p>
                        <p className="text-sm text-foreground">
                          {formatDateFull(b.date)}
                        </p>
                        <p className="text-sm text-foreground">
                          {formatTime(b.startTime)} – {formatTime(b.endTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                          Booked by
                        </p>
                        <p className="text-sm text-foreground">{b.bookerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {b.bookerEmail}
                        </p>
                      </div>
                      {b.bookerNotes && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                            Notes
                          </p>
                          <p className="text-sm text-foreground bg-background rounded-md p-2.5 border border-border">
                            {b.bookerNotes}
                          </p>
                        </div>
                      )}
                      {b.customResponses &&
                        Object.keys(b.customResponses).length > 0 && (
                          <div className="sm:col-span-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                              Additional Information
                            </p>
                            <div className="space-y-2">
                              {Object.entries(b.customResponses).map(
                                ([q, a]) => (
                                  <div
                                    key={q}
                                    className="bg-background rounded-md p-2.5 border border-border"
                                  >
                                    <p className="text-xs text-muted-foreground">
                                      {q}
                                    </p>
                                    <p className="text-sm text-foreground mt-0.5">
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
                          <p className="text-xs font-medium text-destructive uppercase mb-1">
                            Cancel reason
                          </p>
                          <p className="text-sm text-foreground">{b.cancelReason}</p>
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
        </TabsContent>
      </Tabs>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This booking will be cancelled and the time slot will be freed up.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label className="text-sm">Reason (optional)</Label>
            <Textarea
              placeholder="Let them know why you're cancelling..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={2}
              className="mt-1.5"
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule booking</DialogTitle>
            <DialogDescription>
              {rescheduleBooking && (
                <>
                  Rescheduling {rescheduleBooking.eventTypeTitle} with{" "}
                  {rescheduleBooking.bookerName}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>New date</Label>
              <Input
                type="date"
                value={rescheduleDate}
                onChange={(e) => handleRescheduleDateChange(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            {rescheduleDate && (
              <div>
                <Label>Available times</Label>
                {rescheduleSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    No available times on this date.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5 mt-1.5 max-h-48 overflow-y-auto">
                    {rescheduleSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setRescheduleTime(slot)}
                        className={`text-sm py-1.5 px-2 rounded-md border transition-colors text-center ${
                          rescheduleTime === slot
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:bg-secondary text-foreground"
                        }`}
                      >
                        {formatTime(slot)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setRescheduleDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReschedule}
                disabled={!rescheduleDate || !rescheduleTime}
              >
                Reschedule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
