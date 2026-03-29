import {
  EventType,
  Booking,
  AvailabilitySchedule,
  Availability,
  DateOverride,
  UserProfile,
} from "./types";

const STORAGE_KEYS = {
  eventTypes: "cal-clone-event-types",
  bookings: "cal-clone-bookings",
  availability: "cal-clone-availability",
  profile: "cal-clone-profile",
};

// ─── Defaults ──────────────────────────────────────────────

function getDefaultProfile(): UserProfile {
  return {
    name: "John Doe",
    email: "john@cal.com",
    bio: "Schedule a meeting with me",
    avatar: "JD",
    username: "johndoe",
    timeFormat: "12h",
    weekStart: "sunday",
    theme: "light",
    brandColor: "#292929",
  };
}

function getDefaultAvailability(): AvailabilitySchedule[] {
  const days: Availability[] = Array.from({ length: 7 }, (_, i) => ({
    id: crypto.randomUUID(),
    dayOfWeek: i,
    startTime: "09:00",
    endTime: "17:00",
    isEnabled: i >= 1 && i <= 5,
  }));
  return [
    {
      id: crypto.randomUUID(),
      name: "Working Hours",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isDefault: true,
      days,
      dateOverrides: [],
    },
  ];
}

function getDefaultEventTypes(): EventType[] {
  return [
    {
      id: crypto.randomUUID(),
      title: "15 Minute Meeting",
      slug: "15min",
      description: "A quick 15 minute chat.",
      duration: 15,
      color: "#292929",
      isActive: true,
      bufferBefore: 0,
      bufferAfter: 0,
      customQuestions: [],
      minNotice: 1,
      maxFutureDays: 60,
    },
    {
      id: crypto.randomUUID(),
      title: "30 Minute Meeting",
      slug: "30min",
      description: "A standard 30 minute meeting to discuss any topic.",
      duration: 30,
      color: "#2563eb",
      isActive: true,
      bufferBefore: 5,
      bufferAfter: 5,
      customQuestions: [
        {
          id: crypto.randomUUID(),
          label: "Please share anything that will help prepare for our meeting.",
          type: "textarea",
          required: false,
        },
      ],
      minNotice: 4,
      maxFutureDays: 60,
    },
    {
      id: crypto.randomUUID(),
      title: "60 Minute Meeting",
      slug: "60min",
      description: "An in-depth 60 minute meeting for detailed discussions.",
      duration: 60,
      color: "#9333ea",
      isActive: true,
      bufferBefore: 10,
      bufferAfter: 10,
      customQuestions: [
        {
          id: crypto.randomUUID(),
          label: "What would you like to discuss?",
          type: "textarea",
          required: true,
        },
        {
          id: crypto.randomUUID(),
          label: "How did you hear about us?",
          type: "select",
          required: false,
          options: ["Google", "Social Media", "Referral", "Other"],
        },
      ],
      minNotice: 24,
      maxFutureDays: 30,
    },
    {
      id: crypto.randomUUID(),
      title: "Secret Meeting",
      slug: "secret",
      description: "A confidential meeting.",
      duration: 45,
      color: "#dc2626",
      isActive: false,
      bufferBefore: 0,
      bufferAfter: 0,
      customQuestions: [],
      minNotice: 1,
      maxFutureDays: 60,
    },
  ];
}

function getDefaultBookings(eventTypes: EventType[]): Booking[] {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const addDays = (d: Date, n: number) => {
    const r = new Date(d);
    r.setDate(d.getDate() + n);
    return r;
  };

  return [
    {
      id: crypto.randomUUID(),
      eventTypeId: eventTypes[1]?.id || "",
      eventTypeTitle: "30 Minute Meeting",
      date: fmt(addDays(today, 1)),
      startTime: "10:00",
      endTime: "10:30",
      bookerName: "Alice Johnson",
      bookerEmail: "alice@example.com",
      bookerNotes: "Let's discuss the Q2 roadmap",
      status: "upcoming",
      createdAt: today.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      eventTypeId: eventTypes[0]?.id || "",
      eventTypeTitle: "15 Minute Meeting",
      date: fmt(addDays(today, 2)),
      startTime: "14:00",
      endTime: "14:15",
      bookerName: "Bob Smith",
      bookerEmail: "bob@example.com",
      status: "upcoming",
      createdAt: today.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      eventTypeId: eventTypes[1]?.id || "",
      eventTypeTitle: "30 Minute Meeting",
      date: fmt(addDays(today, 3)),
      startTime: "11:00",
      endTime: "11:30",
      bookerName: "Diana Prince",
      bookerEmail: "diana@example.com",
      bookerNotes: "Partnership discussion",
      status: "upcoming",
      createdAt: today.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      eventTypeId: eventTypes[2]?.id || "",
      eventTypeTitle: "60 Minute Meeting",
      date: fmt(addDays(today, 5)),
      startTime: "09:00",
      endTime: "10:00",
      bookerName: "Eve Martinez",
      bookerEmail: "eve@example.com",
      customResponses: { "What would you like to discuss?": "Product strategy for next quarter" },
      status: "upcoming",
      createdAt: today.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      eventTypeId: eventTypes[1]?.id || "",
      eventTypeTitle: "30 Minute Meeting",
      date: fmt(addDays(today, -1)),
      startTime: "09:00",
      endTime: "09:30",
      bookerName: "Charlie Brown",
      bookerEmail: "charlie@example.com",
      status: "past",
      createdAt: addDays(today, -3).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      eventTypeId: eventTypes[0]?.id || "",
      eventTypeTitle: "15 Minute Meeting",
      date: fmt(addDays(today, -3)),
      startTime: "15:00",
      endTime: "15:15",
      bookerName: "Frank Castle",
      bookerEmail: "frank@example.com",
      status: "past",
      createdAt: addDays(today, -5).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      eventTypeId: eventTypes[1]?.id || "",
      eventTypeTitle: "30 Minute Meeting",
      date: fmt(addDays(today, -2)),
      startTime: "16:00",
      endTime: "16:30",
      bookerName: "Grace Hopper",
      bookerEmail: "grace@example.com",
      status: "cancelled",
      cancelledAt: addDays(today, -2).toISOString(),
      cancelReason: "Schedule conflict",
      createdAt: addDays(today, -4).toISOString(),
    },
  ];
}

// ─── Storage helpers ───────────────────────────────────────

function loadFromStorage<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Initialize ────────────────────────────────────────────

export function initializeStore() {
  if (!localStorage.getItem(STORAGE_KEYS.eventTypes)) {
    const eventTypes = getDefaultEventTypes();
    saveToStorage(STORAGE_KEYS.eventTypes, eventTypes);
    saveToStorage(STORAGE_KEYS.bookings, getDefaultBookings(eventTypes));
    saveToStorage(STORAGE_KEYS.availability, getDefaultAvailability());
    saveToStorage(STORAGE_KEYS.profile, getDefaultProfile());
  }
}

// ─── Profile ───────────────────────────────────────────────

export function getProfile(): UserProfile {
  return loadFromStorage<UserProfile>(STORAGE_KEYS.profile) || getDefaultProfile();
}

export function saveProfile(profile: UserProfile): void {
  saveToStorage(STORAGE_KEYS.profile, profile);
}

// ─── Event Types ───────────────────────────────────────────

export function getEventTypes(): EventType[] {
  return loadFromStorage<EventType[]>(STORAGE_KEYS.eventTypes) || [];
}

export function getEventType(id: string): EventType | undefined {
  return getEventTypes().find((e) => e.id === id);
}

export function getEventTypeBySlug(slug: string): EventType | undefined {
  return getEventTypes().find((e) => e.slug === slug);
}

export function saveEventType(eventType: EventType): void {
  const types = getEventTypes();
  const idx = types.findIndex((e) => e.id === eventType.id);
  if (idx >= 0) types[idx] = eventType;
  else types.push(eventType);
  saveToStorage(STORAGE_KEYS.eventTypes, types);
}

export function deleteEventType(id: string): void {
  const types = getEventTypes().filter((e) => e.id !== id);
  saveToStorage(STORAGE_KEYS.eventTypes, types);
}

export function duplicateEventType(id: string): EventType | null {
  const et = getEventType(id);
  if (!et) return null;
  const dup: EventType = {
    ...et,
    id: crypto.randomUUID(),
    title: `${et.title} (Copy)`,
    slug: `${et.slug}-copy`,
    customQuestions: et.customQuestions.map((q) => ({ ...q, id: crypto.randomUUID() })),
  };
  saveEventType(dup);
  return dup;
}

// ─── Availability Schedules ────────────────────────────────

export function getAvailabilitySchedules(): AvailabilitySchedule[] {
  const data = loadFromStorage<AvailabilitySchedule[]>(STORAGE_KEYS.availability);
  return Array.isArray(data) ? data : getDefaultAvailability();
}

export function getAvailability(): AvailabilitySchedule {
  const schedules = getAvailabilitySchedules();
  return schedules.find((s) => s.isDefault) || schedules[0];
}

export function saveAvailabilitySchedules(schedules: AvailabilitySchedule[]): void {
  saveToStorage(STORAGE_KEYS.availability, schedules);
}

export function saveAvailability(schedule: AvailabilitySchedule): void {
  const schedules = getAvailabilitySchedules();
  const idx = schedules.findIndex((s) => s.id === schedule.id);
  if (idx >= 0) schedules[idx] = schedule;
  else schedules.push(schedule);
  saveToStorage(STORAGE_KEYS.availability, schedules);
}

export function deleteAvailabilitySchedule(id: string): void {
  let schedules = getAvailabilitySchedules().filter((s) => s.id !== id);
  if (schedules.length > 0 && !schedules.some((s) => s.isDefault)) {
    schedules[0].isDefault = true;
  }
  saveToStorage(STORAGE_KEYS.availability, schedules);
}

export function addDateOverride(scheduleId: string, override: DateOverride): void {
  const schedules = getAvailabilitySchedules();
  const schedule = schedules.find((s) => s.id === scheduleId);
  if (schedule) {
    schedule.dateOverrides = schedule.dateOverrides.filter((o) => o.date !== override.date);
    schedule.dateOverrides.push(override);
    saveToStorage(STORAGE_KEYS.availability, schedules);
  }
}

export function removeDateOverride(scheduleId: string, overrideId: string): void {
  const schedules = getAvailabilitySchedules();
  const schedule = schedules.find((s) => s.id === scheduleId);
  if (schedule) {
    schedule.dateOverrides = schedule.dateOverrides.filter((o) => o.id !== overrideId);
    saveToStorage(STORAGE_KEYS.availability, schedules);
  }
}

// ─── Bookings ──────────────────────────────────────────────

export function getBookings(): Booking[] {
  return loadFromStorage<Booking[]>(STORAGE_KEYS.bookings) || [];
}

export function getBooking(id: string): Booking | undefined {
  return getBookings().find((b) => b.id === id);
}

export function saveBooking(booking: Booking): void {
  const bookings = getBookings();
  const idx = bookings.findIndex((b) => b.id === booking.id);
  if (idx >= 0) bookings[idx] = booking;
  else bookings.push(booking);
  saveToStorage(STORAGE_KEYS.bookings, bookings);
}

export function cancelBooking(id: string, reason?: string): void {
  const bookings = getBookings();
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx >= 0) {
    bookings[idx].status = "cancelled";
    bookings[idx].cancelledAt = new Date().toISOString();
    if (reason) bookings[idx].cancelReason = reason;
    saveToStorage(STORAGE_KEYS.bookings, bookings);
  }
}

export function rescheduleBooking(
  oldBookingId: string,
  newDate: string,
  newStartTime: string,
  newEndTime: string
): Booking | null {
  const bookings = getBookings();
  const oldBooking = bookings.find((b) => b.id === oldBookingId);
  if (!oldBooking) return null;

  const newBooking: Booking = {
    ...oldBooking,
    id: crypto.randomUUID(),
    date: newDate,
    startTime: newStartTime,
    endTime: newEndTime,
    status: "upcoming",
    rescheduledFrom: oldBookingId,
    createdAt: new Date().toISOString(),
  };

  oldBooking.status = "rescheduled";
  oldBooking.rescheduledTo = newBooking.id;

  bookings.push(newBooking);
  saveToStorage(STORAGE_KEYS.bookings, bookings);
  return newBooking;
}

// ─── Slot calculation ──────────────────────────────────────

export function getAvailableSlots(
  date: string,
  duration: number,
  bufferBefore: number = 0,
  bufferAfter: number = 0,
  minNoticeHours: number = 0
): string[] {
  const availability = getAvailability();
  const dayOfWeek = new Date(date + "T00:00:00").getDay();

  // Check for date override
  const override = availability.dateOverrides?.find((o) => o.date === date);
  if (override?.isBlocked) return [];

  const dayAvail = availability.days.find((d) => d.dayOfWeek === dayOfWeek);
  if (!dayAvail || !dayAvail.isEnabled) return [];

  const startTime = override?.startTime || dayAvail.startTime;
  const endTime = override?.endTime || dayAvail.endTime;

  const bookings = getBookings().filter(
    (b) => b.date === date && b.status !== "cancelled" && b.status !== "rescheduled"
  );

  const slots: string[] = [];
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  // Calculate minimum booking time based on notice period
  const now = new Date();
  const dateObj = new Date(date + "T00:00:00");
  const isToday =
    now.getFullYear() === dateObj.getFullYear() &&
    now.getMonth() === dateObj.getMonth() &&
    now.getDate() === dateObj.getDate();
  const minBookingMinute = isToday
    ? now.getHours() * 60 + now.getMinutes() + minNoticeHours * 60
    : 0;

  const totalSlotSize = bufferBefore + duration + bufferAfter;

  for (let m = startMinutes; m + totalSlotSize <= endMinutes; m += duration) {
    const actualStart = m + bufferBefore;
    if (actualStart < minBookingMinute) continue;

    const slotStart = minutesToTime(actualStart);
    const slotEndMin = actualStart + duration;

    const isBooked = bookings.some((b) => {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      return actualStart < bEnd && slotEndMin > bStart;
    });

    if (!isBooked) {
      slots.push(slotStart);
    }
  }

  return slots;
}

// ─── Helpers ───────────────────────────────────────────────

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

export function formatTime(time: string, format: "12h" | "24h" = "12h"): string {
  const [h, m] = time.split(":").map(Number);
  if (format === "24h") return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")}${ampm}`;
}

export function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getBookingStats() {
  const bookings = getBookings();
  const today = new Date().toISOString().split("T")[0];
  return {
    total: bookings.length,
    upcoming: bookings.filter((b) => b.status === "upcoming" && b.date >= today).length,
    past: bookings.filter((b) => b.status === "past" || (b.status === "upcoming" && b.date < today)).length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };
}
