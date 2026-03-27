export interface EventType {
  id: string;
  title: string;
  slug: string;
  description: string;
  duration: number; // minutes
  color: string;
  isActive: boolean;
}

export interface Availability {
  id: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, ...
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  isEnabled: boolean;
}

export interface Booking {
  id: string;
  eventTypeId: string;
  eventTypeTitle: string;
  date: string; // "2025-01-15"
  startTime: string; // "09:00"
  endTime: string; // "09:30"
  bookerName: string;
  bookerEmail: string;
  status: "upcoming" | "past" | "cancelled";
  createdAt: string;
}

export interface AvailabilitySchedule {
  timezone: string;
  days: Availability[];
}

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const EVENT_COLORS = [
  "#292929",
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#ca8a04",
  "#9333ea",
  "#db2777",
  "#ea580c",
];
