import { useParams, Link } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  getEventTypeBySlug,
  getAvailableSlots,
  saveBooking,
  formatTime,
  getAvailability,
  getProfile,
} from "@/lib/store";
import { Booking, CustomQuestion } from "@/lib/types";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Globe,
  ArrowLeft,
  Check,
  User,
  Mail,
  Video,
  MessageSquare,
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
      <div className="min-h-screen bg-cal-subtle flex items-center justify-center">
        <div className="cal-card max-w-sm w-full p-8 text-center mx-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground mb-2">
            This event is not available
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            This event type doesn't exist, has been removed, or is currently disabled.
          </p>
          <Link to="/">
            <Button variant="outline" size="sm">
              Go to homepage
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Max future date
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + (eventType.maxFutureDays || 60));
  const maxDateStr = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, "0")}-${String(maxDate.getDate()).padStart(2, "0")}`;

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

  const isPastMonth = currentYear === today.getFullYear() && currentMonth === today.getMonth();

  const isDateAvailable = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (dateStr < todayStr || dateStr > maxDateStr) return false;

    // Check date overrides
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

    // Validate required custom questions
    const missingRequired = eventType.customQuestions.filter(
      (q) => q.required && !form.customResponses[q.label]?.trim()
    );
    if (missingRequired.length > 0) {
      toast.error(`Please answer: ${missingRequired[0].label}`);
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
      bookerNotes: form.notes || undefined,
      customResponses:
        Object.keys(form.customResponses).length > 0
          ? form.customResponses
          : undefined,
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
      <div className="min-h-screen bg-cal-subtle flex items-center justify-center p-4">
        <div className="cal-card max-w-md w-full p-8 text-center animate-fade-in">
          <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-5">
            <CalendarCheck className="h-7 w-7 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-1">
            This meeting is scheduled
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            We emailed you and the other attendees a calendar invitation with all the details.
          </p>

          <div className="text-left bg-cal-subtle rounded-lg p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-1 h-full rounded-full self-stretch" style={{ backgroundColor: eventType.color }} />
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">What</p>
                  <p className="text-sm font-semibold text-foreground">{confirmedBooking.eventTypeTitle}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">When</p>
                  <p className="text-sm text-foreground">
                    {d.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-foreground">
                    {formatTime(confirmedBooking.startTime)} – {formatTime(confirmedBooking.endTime)}{" "}
                    <span className="text-muted-foreground">
                      ({availability.timezone.replace(/_/g, " ")})
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Who</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-[9px] font-semibold text-primary-foreground">
                        {profile.avatar}
                      </span>
                    </div>
                    <span className="text-sm text-foreground">{profile.name}</span>
                    <span className="text-xs text-muted-foreground">(Host)</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-[9px] font-semibold text-foreground">
                        {confirmedBooking.bookerName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                    <span className="text-sm text-foreground">
                      {confirmedBooking.bookerName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button
              variant="outline"
              className="flex-1"
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cal-subtle flex items-center justify-center p-4">
      <div className="cal-card max-w-4xl w-full overflow-hidden animate-fade-in">
        <div className="flex flex-col md:flex-row min-h-[480px]">
          {/* Left panel: Event info */}
          <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-border p-6 flex flex-col">
            {step === "form" && (
              <button
                onClick={() => setStep("calendar")}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 -mt-1 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}
            <div className="flex items-center gap-2 mb-1">
              <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-semibold text-primary-foreground">
                  {profile.avatar}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">{profile.name}</span>
            </div>
            <h1 className="text-xl font-bold text-foreground mt-3">
              {eventType.title}
            </h1>
            {eventType.description && (
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                {eventType.description}
              </p>
            )}
            <div className="flex flex-col gap-2.5 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 flex-shrink-0" />
                {eventType.duration} min
              </span>
              <span className="flex items-center gap-2">
                <Video className="h-4 w-4 flex-shrink-0" />
                Web conferencing details provided upon confirmation.
              </span>
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4 flex-shrink-0" />
                {availability.timezone.replace(/_/g, " ")}
              </span>
            </div>
            {selectedDate && selectedTime && (
              <div className="mt-4 pt-4 border-t border-border">
                <span className="flex items-center gap-2 text-sm text-foreground font-medium">
                  <Calendar className="h-4 w-4" />
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </span>
                <span className="text-sm text-foreground mt-1 block ml-6">
                  {formatTime(selectedTime)}
                </span>
              </div>
            )}
          </div>

          {/* Right panel: Calendar or Form */}
          <div className="flex-1 p-6 overflow-auto">
            {step === "calendar" && (
              <div className="flex flex-col md:flex-row gap-6 h-full">
                {/* Calendar grid */}
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-foreground mb-1">
                    Select a Date & Time
                  </h2>
                  <div className="flex items-center justify-between mb-4 mt-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      {MONTH_NAMES[currentMonth]} {currentYear}
                    </h3>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={prevMonth}
                        disabled={isPastMonth}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={nextMonth}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-0">
                    {DAY_LABELS.map((d) => (
                      <div
                        key={d}
                        className="text-center text-xs font-medium text-muted-foreground py-2"
                      >
                        {d}
                      </div>
                    ))}
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                      (day) => {
                        const dateStr = `${currentYear}-${String(
                          currentMonth + 1
                        ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                        const available = isDateAvailable(day);
                        const isSelected = selectedDate === dateStr;
                        const isToday = dateStr === todayStr;

                        return (
                          <button
                            key={day}
                            disabled={!available}
                            onClick={() => selectDate(day)}
                            className={`h-10 w-10 mx-auto text-sm rounded-full flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-foreground text-background font-semibold"
                                : available
                                ? "hover:bg-secondary text-foreground font-medium cursor-pointer"
                                : "text-muted-foreground/30 cursor-not-allowed"
                            } ${
                              isToday && !isSelected
                                ? "ring-1 ring-foreground/30"
                                : ""
                            }`}
                          >
                            {day}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Time slots */}
                {selectedDate && (
                  <div className="md:w-52 md:border-l md:border-border md:pl-6 animate-fade-in">
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </h3>
                    <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                      {availableSlots.length === 0 && (
                        <p className="text-xs text-muted-foreground py-4">
                          No available times for this date.
                        </p>
                      )}
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => {
                            setSelectedTime(slot);
                            setStep("form");
                          }}
                          className="w-full text-sm font-medium py-2.5 px-3 rounded-md border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-center"
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
                <h2 className="text-base font-semibold text-foreground mb-4">
                  Enter Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      Your name *
                    </Label>
                    <Input
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      Email address *
                    </Label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Additional notes
                    </Label>
                    <Textarea
                      placeholder="Please share anything that will help prepare for our meeting."
                      value={form.notes}
                      onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                      }
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  {/* Custom questions */}
                  {eventType.customQuestions.map((q) => (
                    <div key={q.id}>
                      <Label>
                        {q.label} {q.required && "*"}
                      </Label>
                      {q.type === "text" && (
                        <Input
                          value={form.customResponses[q.label] || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              customResponses: {
                                ...form.customResponses,
                                [q.label]: e.target.value,
                              },
                            })
                          }
                          className="mt-1"
                        />
                      )}
                      {q.type === "textarea" && (
                        <Textarea
                          value={form.customResponses[q.label] || ""}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              customResponses: {
                                ...form.customResponses,
                                [q.label]: e.target.value,
                              },
                            })
                          }
                          rows={3}
                          className="mt-1"
                        />
                      )}
                      {q.type === "select" && q.options && (
                        <Select
                          value={form.customResponses[q.label] || ""}
                          onValueChange={(v) =>
                            setForm({
                              ...form,
                              customResponses: {
                                ...form.customResponses,
                                [q.label]: v,
                              },
                            })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            {q.options.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}

                  <p className="text-xs text-muted-foreground">
                    By proceeding, you confirm that you have read and agree to Cal.com's terms.
                  </p>

                  <Button onClick={handleBook} className="w-full" size="lg">
                    Confirm booking
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Powered by */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2">
        <span className="text-[11px] text-muted-foreground/60">
          Powered by Cal.com
        </span>
      </div>
    </div>
  );
}
