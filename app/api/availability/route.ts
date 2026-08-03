import { NextResponse } from "next/server";
import { addMinutes } from "date-fns";
import { prisma } from "@/lib/prisma";
import { activeStatuses, CLOSED_DAYS, isWithinBusinessHours, SALON_TIMEZONE, zonedStart } from "@/lib/booking-server";
import { toZonedTime } from "date-fns-tz";

const slotTimes = ["09:00", "09:45", "10:30", "11:15", "12:00", "13:00", "13:45", "14:30", "15:15", "16:00", "16:45", "17:30"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || "";
  const duration = Number(searchParams.get("duration"));

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isInteger(duration) || duration < 15 || duration > 120) {
    return NextResponse.json({ error: "Invalid date or service duration." }, { status: 400 });
  }

  const midday = zonedStart(date, "12:00");
  if (CLOSED_DAYS.has(toZonedTime(midday, SALON_TIMEZONE).getDay())) {
    return NextResponse.json({ slots: [] });
  }

  const candidates = slotTimes
    .map((time) => ({ time, startAt: zonedStart(date, time) }))
    .map((slot) => ({ ...slot, endAt: addMinutes(slot.startAt, duration) }))
    .filter((slot) => slot.startAt.getTime() > Date.now() + 15 * 60_000 && isWithinBusinessHours(slot.startAt, slot.endAt));

  if (!candidates.length) return NextResponse.json({ slots: [] });

  const dayStart = zonedStart(date, "00:00");
  const dayEnd = zonedStart(date, "23:59");
  const bookings = await prisma.booking.findMany({
    where: { status: { in: activeStatuses() }, startAt: { lt: dayEnd }, endAt: { gt: dayStart } },
    select: { startAt: true, endAt: true },
  });

  const slots = candidates
    .filter((slot) => !bookings.some((booking) => booking.startAt < slot.endAt && booking.endAt > slot.startAt))
    .map((slot) => slot.time);

  return NextResponse.json({ slots });
}
