import { EventType, Booking, AvailabilitySchedule, Availability } from "./types";

const STORAGE_KEYS = {
  eventTypes: "cal-clone-event-types",
  bookings: "cal-clone-bookings",
  availability: "cal-clone-availability",
};

// Default availability: Mon-Fri 9-5
function getDefaultAvailability(): AvailabilitySchedule {
  const days: Availability[] = Array.from({ length: 7 }, (_, i) => ({
    id: crypto.randomUUID(),
    dayOfWeek: i,
    startTime: "09:00",
    endTime: "17:00",
    isEnabled: i >= 1 && i <= 5,
  }));
  return { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, days };
}

function getDefaultEventTypes(): EventType[] {
  return [
    {
      id: crypto.randomUUID(),
      title: "15 Min Meeting",
      slug: "15min",
      description: "A quick 15 minute meeting.",
      duration: 15,
      color: "#292929",
      isActive: true,
    },
    {
      id: crypto.randomUUID(),
      title: "30 Min Meeting",
      slug: "30min",
      description: "A standard 30 minute meeting to discuss any topic.",
      duration: 30,
      color: "#2563eb",
      isActive: true,
    },
    {
      id: crypto.randomUUID(),
      title: "Secret Meeting",
      slug: "secret",
      description: "A confidential meeting.",
      duration: 60,
      color: "#9333ea",
      isActive: false,
    },
  ];
}

function getDefaultBookings(eventTypes: EventType[]): Booking[] {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(today.getDate() + 2);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  return [
    {
      id: crypto.randomUUID(),
      eventTypeId: eventTypes[1]?.id || "",
      eventTypeTitle: "30 Min Meeting",
      date: fmt(tomorrow),
      startTime: "10:00",
      endTime: "10:30",
      bookerName: "Alice Johnson",
      bookerEmail: "alice@example.com",
      status: "upcoming",
      createdAt: today.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      eventTypeId: eventTypes[0]?.id || "",
      eventTypeTitle: "15 Min Meeting",
      date: fmt(dayAfter),
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
      eventTypeTitle: "30 Min Meeting",
      date: fmt(yesterday),
      startTime: "09:00",
      endTime: "09:30",
      bookerName: "Charlie Brown",
      bookerEmail: "charlie@example.com",
      status: "past",
      createdAt: yesterday.toISOString(),
    },
  ];
}

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

// Initialize with seed data if empty
export function initializeStore() {
  if (!localStorage.getItem(STORAGE_KEYS.eventTypes)) {
    const eventTypes = getDefaultEventTypes();
    saveToStorage(STORAGE_KEYS.eventTypes, eventTypes);
    saveToStorage(STORAGE_KEYS.bookings, getDefaultBookings(eventTypes));
    saveToStorage(STORAGE_KEYS.availability, getDefaultAvailability());
  }
}

// Event Types
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

// Availability
export function getAvailability(): AvailabilitySchedule {
  return loadFromStorage<AvailabilitySchedule>(STORAGE_KEYS.availability) || getDefaultAvailability();
}

export function saveAvailability(schedule: AvailabilitySchedule): void {
  saveToStorage(STORAGE_KEYS.availability, schedule);
}

// Bookings
export function getBookings(): Booking[] {
  return loadFromStorage<Booking[]>(STORAGE_KEYS.bookings) || [];
}

export function saveBooking(booking: Booking): void {
  const bookings = getBookings();
  bookings.push(booking);
  saveToStorage(STORAGE_KEYS.bookings, bookings);
}

export function cancelBooking(id: string): void {
  const bookings = getBookings();
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx >= 0) {
    bookings[idx].status = "cancelled";
    saveToStorage(STORAGE_KEYS.bookings, bookings);
  }
}

export function getAvailableSlots(date: string, duration: number): string[] {
  const availability = getAvailability();
  const dayOfWeek = new Date(date + "T00:00:00").getDay();
  const dayAvail = availability.days.find((d) => d.dayOfWeek === dayOfWeek);

  if (!dayAvail || !dayAvail.isEnabled) return [];

  const bookings = getBookings().filter(
    (b) => b.date === date && b.status !== "cancelled"
  );

  const slots: string[] = [];
  const [startH, startM] = dayAvail.startTime.split(":").map(Number);
  const [endH, endM] = dayAvail.endTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  for (let m = startMinutes; m + duration <= endMinutes; m += duration) {
    const slotStart = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    const slotEndMin = m + duration;
    const slotEnd = `${String(Math.floor(slotEndMin / 60)).padStart(2, "0")}:${String(slotEndMin % 60).padStart(2, "0")}`;

    const isBooked = bookings.some((b) => {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      return m < bEnd && slotEndMin > bStart;
    });

    if (!isBooked) {
      slots.push(slotStart);
    }
  }

  return slots;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}
