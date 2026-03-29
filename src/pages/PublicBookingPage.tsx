import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getEventTypeBySlug,
  getAvailableSlots,
  saveBooking,
  formatTime,
  getAvailability,
  getProfile,
} from "@/lib/store";
import { Booking } from "@/lib/types";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Globe,
  ArrowLeft,
  User,
  Mail,
  Video,
  CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const profile = getProfile();

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<"calendar" | "form" | "confirmed">("calendar");
  const [form, setForm] = useState({
    name: "",
    email: "",
    notes: "",
    customResponses: {} as Record<string, string>,
  });
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const availableSlots = useMemo(() => {
    if (!selectedDate || !eventType) return [];
    return getAvailableSlots(
      selectedDate,
      eventType.duration,
      eventType.bufferBefore,
      eventType.bufferAfter,
      eventType.minNotice
    );
  }, [selectedDate, eventType]);

  if (!eventType || (!eventType.isActive && step !== "confirmed")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="rounded-lg border border-border bg-card max-w-sm w-full p-8 text-center mx-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground mb-2">
            This event is not available
          </h1>
          <p className="text-[13px] text-muted-foreground mb-6">
            This event type doesn't exist or is currently disabled.
          </p>
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

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + (eventType.maxFutureDays || 60));
  const maxDateStr = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, "0")}-${String(maxDate.getDate()).padStart(2, "0")}`;

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  const isPastMonth = currentYear === today.getFullYear() && currentMonth === today.getMonth();

  const isDateAvailable = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (dateStr < todayStr || dateStr > maxDateStr) return false;
    const override = availability.dateOverrides?.find((o) => o.date === dateStr);
    if (override?.isBlocked) return false;
    const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
    const dayAvail = availability.days.find((d) => d.dayOfWeek === dayOfWeek);
    return dayAvail?.isEnabled || (override && !override.isBlocked) || false;
  };

  const selectDate = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setSelectedTime(null);
  };

  const handleBook = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Please fill in your name and email");
      return;
    }
    if (!form.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    const missingRequired = eventType.customQuestions.filter(
      (q) => q.required && !form.customResponses[q.label]?.trim()
    );
    if (missingRequired.length > 0) {
      toast.error(`Please answer: ${missingRequired[0].label}`);
      return;
    }
    if (!selectedDate || !selectedTime) return;

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
      bookerNotes: form.notes || undefined,
      customResponses: Object.keys(form.customResponses).length > 0 ? form.customResponses : undefined,
      status: "upcoming",
      createdAt: new Date().toISOString(),
    };
    saveBooking(booking);
    setConfirmedBooking(booking);
    setStep("confirmed");
  };

  // Confirmed state
  if (step === "confirmed" && confirmedBooking) {
    const d = new Date(confirmedBooking.date + "T00:00:00");
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="rounded-lg border border-border bg-card max-w-md w-full p-8 text-center animate-fade-in">
          <div className="mx-auto w-16 h-16 rounded-full bg-cal-success/10 flex items-center justify-center mb-5">
            <CalendarCheck className="h-8 w-8" style={{ color: "hsl(var(--cal-success))" }} />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-1">
            This meeting is scheduled
          </h1>
          <p className="text-[13px] text-muted-foreground mb-6">
            We emailed you and the other attendees a calendar invitation with all the details.
          </p>

          <div className="text-left bg-secondary/30 rounded-lg p-5 space-y-4 border border-border">
            <div className="flex gap-3">
              <div className="w-1 rounded-full self-stretch shrink-0" style={{ backgroundColor: eventType.color }} />
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">What</p>
                  <p className="text-[13px] font-semibold text-foreground">{confirmedBooking.eventTypeTitle}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">When</p>
                  <p className="text-[13px] text-foreground">
                    {d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  </p>
                  <p className="text-[13px] text-foreground">
                    {formatTime(confirmedBooking.startTime)} – {formatTime(confirmedBooking.endTime)}{" "}
                    <span className="text-muted-foreground">({availability.timezone.replace(/_/g, " ")})</span>
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Who</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-6 w-6 rounded-full bg-foreground flex items-center justify-center">
                      <span className="text-[9px] font-semibold text-background">{profile.avatar}</span>
                    </div>
                    <span className="text-[13px] text-foreground">{profile.name}</span>
                    <span className="text-[11px] text-muted-foreground">(Host)</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-[9px] font-semibold text-foreground">
                        {confirmedBooking.bookerName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <span className="text-[13px] text-foreground">{confirmedBooking.bookerName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full mt-5 text-[13px]"
            onClick={() => {
              setStep("calendar");
              setSelectedDate(null);
              setSelectedTime(null);
              setForm({ name: "", email: "", notes: "", customResponses: {} });
              setConfirmedBooking(null);
            }}
          >
            Book another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="rounded-lg border border-border bg-card max-w-4xl w-full overflow-hidden animate-fade-in shadow-lg">
        <div className="flex flex-col md:flex-row min-h-[520px]">
          {/* Left panel */}
          <div className="w-full md:w-[280px] border-b md:border-b-0 md:border-r border-border p-6 flex flex-col">
            {step === "form" && (
              <button
                onClick={() => setStep("calendar")}
                className="flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground mb-4 -mt-1 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}
            <div className="flex items-center gap-2 mb-3">
              <div className="h-10 w-10 rounded-full bg-foreground flex items-center justify-center">
                <span className="text-xs font-bold text-background">{profile.avatar}</span>
              </div>
              <span className="text-[13px] text-muted-foreground">{profile.name}</span>
            </div>
            <h1 className="text-lg font-bold text-foreground">
              {eventType.title}
            </h1>
            {eventType.description && (
              <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
                {eventType.description}
              </p>
            )}
            <div className="flex flex-col gap-2.5 mt-5 text-[13px] text-muted-foreground">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" />
                {eventType.duration} min
              </span>
              <span className="flex items-center gap-2">
                <Video className="h-4 w-4 shrink-0" />
                Cal Video
              </span>
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4 shrink-0" />
                {availability.timezone.replace(/_/g, " ")}
              </span>
            </div>
            {selectedDate && selectedTime && (
              <div className="mt-5 pt-4 border-t border-border">
                <span className="flex items-center gap-2 text-[13px] text-foreground font-medium">
                  <Calendar className="h-4 w-4" />
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "long", month: "long", day: "numeric",
                  })}
                </span>
                <span className="text-[13px] text-foreground mt-1 block ml-6">
                  {formatTime(selectedTime)}
                </span>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="flex-1 p-6 overflow-auto">
            {step === "calendar" && (
              <div className="flex flex-col md:flex-row gap-6 h-full">
                {/* Calendar */}
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-foreground mb-4">
                    Select a Date & Time
                  </h2>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[13px] font-semibold text-foreground">
                      {MONTH_NAMES[currentMonth]} {currentYear}
                    </h3>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth} disabled={isPastMonth}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-0">
                    {DAY_LABELS.map((d) => (
                      <div key={d} className="text-center text-[11px] font-medium text-muted-foreground py-2">
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
                          className={`h-10 w-10 mx-auto text-[13px] rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-foreground text-background font-semibold"
                              : available
                              ? "hover:bg-secondary text-foreground font-medium cursor-pointer"
                              : "text-muted-foreground/25 cursor-not-allowed"
                          } ${isToday && !isSelected ? "ring-1 ring-foreground/20" : ""}`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time slots */}
                {selectedDate && (
                  <div className="md:w-48 md:border-l md:border-border md:pl-5 animate-fade-in">
                    <h3 className="text-[13px] font-semibold text-foreground mb-3">
                      {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "short", month: "short", day: "numeric",
                      })}
                    </h3>
                    {availableSlots.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No available times on this date.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                        {availableSlots.map((slot) => {
                          const isSlotSelected = selectedTime === slot;
                          return (
                            <div key={slot} className="flex gap-1.5">
                              <button
                                onClick={() => setSelectedTime(slot)}
                                className={`flex-1 py-2 px-3 rounded-md text-[13px] font-medium text-center transition-all border ${
                                  isSlotSelected
                                    ? "bg-foreground text-background border-foreground"
                                    : "border-border hover:border-foreground/40 text-foreground"
                                }`}
                              >
                                {formatTime(slot)}
                              </button>
                              {isSlotSelected && (
                                <Button
                                  size="sm"
                                  className="h-auto px-3 text-xs animate-fade-in"
                                  onClick={() => setStep("form")}
                                >
                                  Confirm
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {step === "form" && (
              <div className="max-w-md animate-fade-in">
                <h2 className="text-sm font-semibold text-foreground mb-4">
                  Your Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label className="text-[13px]">Your name *</Label>
                    <Input
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="mt-1.5 text-[13px]"
                    />
                  </div>
                  <div>
                    <Label className="text-[13px]">Email address *</Label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="mt-1.5 text-[13px]"
                    />
                  </div>
                  <div>
                    <Label className="text-[13px]">Additional notes</Label>
                    <Textarea
                      placeholder="Please share anything that will help prepare for our meeting."
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={3}
                      className="mt-1.5 text-[13px]"
                    />
                  </div>

                  {eventType.customQuestions.map((q) => (
                    <div key={q.id}>
                      <Label className="text-[13px]">
                        {q.label} {q.required && "*"}
                      </Label>
                      {q.type === "select" ? (
                        <Select
                          value={form.customResponses[q.label] || ""}
                          onValueChange={(v) =>
                            setForm({ ...form, customResponses: { ...form.customResponses, [q.label]: v } })
                          }
                        >
                          <SelectTrigger className="mt-1.5 text-[13px]">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {q.options?.map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : q.type === "textarea" ? (
                        <Textarea
                          placeholder="Your answer..."
                          value={form.customResponses[q.label] || ""}
                          onChange={(e) =>
                            setForm({ ...form, customResponses: { ...form.customResponses, [q.label]: e.target.value } })
                          }
                          rows={3}
                          className="mt-1.5 text-[13px]"
                        />
                      ) : (
                        <Input
                          placeholder="Your answer..."
                          value={form.customResponses[q.label] || ""}
                          onChange={(e) =>
                            setForm({ ...form, customResponses: { ...form.customResponses, [q.label]: e.target.value } })
                          }
                          className="mt-1.5 text-[13px]"
                        />
                      )}
                    </div>
                  ))}

                  <Button onClick={handleBook} className="w-full text-[13px]">
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
