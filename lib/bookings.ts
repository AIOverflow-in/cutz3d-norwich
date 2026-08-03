import type { Booking } from "./data";

const KEY = "cutz3d-demo-bookings";

export function readBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as Booking[];
  } catch {
    return [];
  }
}

export function saveBookings(bookings: Booking[]) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(bookings));
}

export function addBooking(booking: Booking) {
  const bookings = readBookings();
  saveBookings([booking, ...bookings.filter((item) => item.id !== booking.id)]);
}

export function updateBooking(id: string, changes: Partial<Booking>) {
  const bookings = readBookings().map((item) => item.id === id ? { ...item, ...changes } : item);
  saveBookings(bookings);
  return bookings;
}
