import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Booking } from "@/lib/types";
import { getBookings, cancelBooking, formatTime } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, Mail, X } from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState("upcoming");

  useEffect(() => {
    refreshBookings();
  }, []);

  const refreshBookings = () => {
    const all = getBookings();
    // Auto-update past bookings
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

  const handleCancel = (id: string) => {
    cancelBooking(id);
    refreshBookings();
    toast.success("Booking cancelled");
  };

  const filtered = bookings.filter((b) => {
    if (tab === "upcoming") return b.status === "upcoming";
    if (tab === "past") return b.status === "past";
    if (tab === "cancelled") return b.status === "cancelled";
    return true;
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          <div className="cal-card overflow-hidden divide-y divide-border">
            {filtered.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-muted-foreground text-sm">No {tab} bookings.</p>
              </div>
            )}
            {filtered.map((b) => (
              <div key={b.id} className="flex items-start sm:items-center justify-between px-5 py-4 hover:bg-cal-subtle transition-colors">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-semibold text-foreground">{b.eventTypeTitle}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(b.date)}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTime(b.startTime)} - {formatTime(b.endTime)}
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
                {b.status === "upcoming" && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive gap-1 shrink-0">
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel booking?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will cancel the booking with {b.bookerName} on {formatDate(b.date)}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleCancel(b.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Cancel booking
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                {b.status === "cancelled" && (
                  <span className="text-xs text-destructive font-medium shrink-0">Cancelled</span>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
