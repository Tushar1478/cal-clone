import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { getEventTypeBySlug, getAvailableSlots, saveBooking, formatTime, getAvailability } from "@/lib/store";
import { Booking } from "@/lib/types";
import { Calendar, Clock, ChevronLeft, ChevronRight, Globe, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function PublicBookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const eventType = getEventTypeBySlug(slug || "");
  const availability = getAvailability();

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<"calendar" | "form" | "confirmed">("calendar");
  const [form, setForm] = useState({ name: "", email: "" });
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const availableSlots = useMemo(() => {
    if (!selectedDate || !eventType) return [];
    return getAvailableSlots(selectedDate, eventType.duration);
  }, [selectedDate, eventType]);

  if (!eventType) {
    return (
      <div className="min-h-screen bg-cal-subtle flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-foreground mb-2">Event not found</h1>
          <p className="text-sm text-muted-foreground mb-4">This event type doesn't exist or has been removed.</p>
          <Link to="/">
            <Button variant="outline" size="sm">Go home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isDateAvailable = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (dateStr < todayStr) return false;
    const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
    const dayAvail = availability.days.find((d) => d.dayOfWeek === dayOfWeek);
    return dayAvail?.isEnabled || false;
  };

  const selectDate = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setSelectedTime(null);
  };

  const handleBook = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!selectedDate || !selectedTime || !eventType) return;

    const endMinutes =
      parseInt(selectedTime.split(":")[0]) * 60 +
      parseInt(selectedTime.split(":")[1]) +
      eventType.duration;
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

    const booking: Booking = {
      id: crypto.randomUUID(),
      eventTypeId: eventType.id,
      eventTypeTitle: eventType.title,
      date: selectedDate,
      startTime: selectedTime,
      endTime,
      bookerName: form.name,
      bookerEmail: form.email,
      status: "upcoming",
      createdAt: new Date().toISOString(),
    };
    saveBooking(booking);
    setConfirmedBooking(booking);
    setStep("confirmed");
  };

  if (step === "confirmed" && confirmedBooking) {
    const d = new Date(confirmedBooking.date + "T00:00:00");
    return (
      <div className="min-h-screen bg-cal-subtle flex items-center justify-center p-4">
        <div className="cal-card max-w-md w-full p-8 text-center animate-fade-in">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-1">This meeting is scheduled</h1>
          <p className="text-sm text-muted-foreground mb-6">
            We sent an email with a calendar invitation with the details to everyone.
          </p>
          <div className="text-left bg-cal-subtle rounded-lg p-4 space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">What</p>
              <p className="text-sm font-medium text-foreground">{confirmedBooking.eventTypeTitle}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">When</p>
              <p className="text-sm text-foreground">
                {d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                <br />
                {formatTime(confirmedBooking.startTime)} - {formatTime(confirmedBooking.endTime)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Who</p>
              <p className="text-sm text-foreground">{confirmedBooking.bookerName}</p>
              <p className="text-xs text-muted-foreground">{confirmedBooking.bookerEmail}</p>
            </div>
          </div>
          <Link to={`/book/${slug}`}>
            <Button variant="outline" className="mt-6 w-full" onClick={() => {
              setStep("calendar");
              setSelectedDate(null);
              setSelectedTime(null);
              setForm({ name: "", email: "" });
              setConfirmedBooking(null);
            }}>
              Book another
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cal-subtle flex items-center justify-center p-4">
      <div className="cal-card max-w-4xl w-full overflow-hidden animate-fade-in">
        <div className="flex flex-col md:flex-row">
          {/* Left: Event info */}
          <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-border p-6">
            {step === "form" && (
              <button
                onClick={() => setStep("calendar")}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-semibold text-primary-foreground">JD</span>
              </div>
              <span className="text-sm text-muted-foreground">John Doe</span>
            </div>
            <h1 className="text-xl font-bold text-foreground mt-3">{eventType.title}</h1>
            {eventType.description && (
              <p className="text-sm text-muted-foreground mt-1">{eventType.description}</p>
            )}
            <div className="flex items-center gap-4 mt-4">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {eventType.duration} min
              </span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                {availability.timezone.replace(/_/g, " ")}
              </span>
            </div>
            {selectedDate && selectedTime && (
              <div className="mt-4 pt-4 border-t border-border">
                <span className="flex items-center gap-1.5 text-sm text-foreground font-medium">
                  <Calendar className="h-4 w-4" />
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="text-sm text-foreground mt-1 block">
                  {formatTime(selectedTime)}
                </span>
              </div>
            )}
          </div>

          {/* Right: Calendar or Form */}
          <div className="flex-1 p-6">
            {step === "calendar" && (
              <div className="flex flex-col md:flex-row gap-6">
                {/* Calendar */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-foreground">
                      {MONTH_NAMES[currentMonth]} {currentYear}
                    </h2>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-0">
                    {DAY_LABELS.map((d) => (
                      <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
                        {d}
                      </div>
                    ))}
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      const available = isDateAvailable(day);
                      const isSelected = selectedDate === dateStr;
                      const isToday = dateStr === todayStr;

                      return (
                        <button
                          key={day}
                          disabled={!available}
                          onClick={() => selectDate(day)}
                          className={`h-10 w-10 mx-auto text-sm rounded-full flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-primary text-primary-foreground font-semibold"
                              : available
                              ? "hover:bg-secondary text-foreground font-medium"
                              : "text-muted-foreground/40 cursor-not-allowed"
                          } ${isToday && !isSelected ? "border border-primary" : ""}`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time slots */}
                {selectedDate && (
                  <div className="md:w-48 md:border-l md:border-border md:pl-6 animate-fade-in">
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </h3>
                    <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                      {availableSlots.length === 0 && (
                        <p className="text-xs text-muted-foreground">No available times</p>
                      )}
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => {
                            setSelectedTime(slot);
                            setStep("form");
                          }}
                          className={`w-full text-sm font-medium py-2 px-3 rounded-md border transition-colors text-center ${
                            selectedTime === slot
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-primary text-primary hover:bg-secondary"
                          }`}
                        >
                          {formatTime(slot)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === "form" && (
              <div className="max-w-sm animate-fade-in">
                <h2 className="text-base font-semibold text-foreground mb-4">Your details</h2>
                <div className="space-y-4">
                  <div>
                    <Label>Your name *</Label>
                    <Input
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Email address *</Label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleBook} className="w-full">
                    Confirm booking
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
