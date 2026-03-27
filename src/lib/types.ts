export interface EventType {
  id: string;
  title: string;
  slug: string;
  description: string;
  duration: number; // minutes
  color: string;
  isActive: boolean;
  bufferBefore: number; // minutes buffer before meeting
  bufferAfter: number; // minutes buffer after meeting
  customQuestions: CustomQuestion[];
  minNotice: number; // minimum hours notice for booking
  maxFutureDays: number; // how many days into the future can be booked
}

export interface CustomQuestion {
  id: string;
  label: string;
  type: "text" | "textarea" | "select";
  required: boolean;
  options?: string[]; // for select type
}

export interface Availability {
  id: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, ...
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  isEnabled: boolean;
}

export interface DateOverride {
  id: string;
  date: string; // "2025-01-15"
  isBlocked: boolean; // if true, entire day is blocked
  startTime?: string; // custom hours for that day
  endTime?: string;
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
  bookerNotes?: string;
  customResponses?: Record<string, string>;
  status: "upcoming" | "past" | "cancelled" | "rescheduled";
  rescheduledTo?: string; // new booking id if rescheduled
  rescheduledFrom?: string; // original booking id
  createdAt: string;
  cancelledAt?: string;
  cancelReason?: string;
}

export interface AvailabilitySchedule {
  id: string;
  name: string;
  timezone: string;
  isDefault: boolean;
  days: Availability[];
  dateOverrides: DateOverride[];
}

export interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatar: string; // initials or URL
  username: string;
  timeFormat: "12h" | "24h";
  weekStart: "sunday" | "monday";
  theme: "light" | "system";
  brandColor: string;
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

export const DAYS_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export const EVENT_COLORS = [
  "#292929",
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#ca8a04",
  "#9333ea",
  "#db2777",
  "#ea580c",
  "#0891b2",
  "#4f46e5",
];

export const DURATION_OPTIONS = [15, 20, 25, 30, 45, 60, 90, 120];

export const BUFFER_OPTIONS = [0, 5, 10, 15, 30, 45, 60];
