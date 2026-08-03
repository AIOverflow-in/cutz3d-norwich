import { createHash, randomBytes } from "node:crypto";
import { BookingStatus, type Booking as DbBooking } from "@prisma/client";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

export const SALON_TIMEZONE = process.env.SALON_TIMEZONE || "Europe/London";
export const OPEN_HOUR = Number(process.env.BOOKING_OPEN_HOUR || 9);
export const CLOSE_HOUR = Number(process.env.BOOKING_CLOSE_HOUR || 18);
export const CLOSED_DAYS = new Set((process.env.BOOKING_CLOSED_DAYS || "0").split(",").map(Number));

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createToken() {
  return randomBytes(32).toString("base64url");
}

export function createReference() {
  return `3D-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export function zonedStart(date: string, time: string) {
  return fromZonedTime(`${date}T${time}:00`, SALON_TIMEZONE);
}

export function isWithinBusinessHours(startAt: Date, endAt: Date) {
  const localStart = toZonedTime(startAt, SALON_TIMEZONE);
  const localEnd = toZonedTime(endAt, SALON_TIMEZONE);
  if (CLOSED_DAYS.has(localStart.getDay())) return false;
  const opens = new Date(localStart); opens.setHours(OPEN_HOUR, 0, 0, 0);
  const closes = new Date(localStart); closes.setHours(CLOSE_HOUR, 0, 0, 0);
  return localStart >= opens && localEnd <= closes;
}

export function statusLabel(status: BookingStatus) {
  return `${status.charAt(0)}${status.slice(1).toLowerCase()}` as "Pending" | "Confirmed" | "Completed" | "Cancelled";
}

export function bookingDto(booking: DbBooking) {
  return {
    id: booking.id,
    reference: booking.reference,
    customerName: booking.customerName,
    email: booking.email,
    phone: booking.phone,
    serviceId: booking.serviceId,
    serviceName: booking.serviceName,
    price: booking.price,
    duration: booking.duration,
    date: formatInTimeZone(booking.startAt, SALON_TIMEZONE, "yyyy-MM-dd"),
    time: formatInTimeZone(booking.startAt, SALON_TIMEZONE, "HH:mm"),
    notes: booking.notes || undefined,
    status: statusLabel(booking.status),
    createdAt: booking.createdAt.toISOString(),
  };
}

export function activeStatuses(): BookingStatus[] {
  return [BookingStatus.PENDING, BookingStatus.CONFIRMED];
}
