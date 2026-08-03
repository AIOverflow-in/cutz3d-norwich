import { NextResponse } from "next/server";
import { addMinutes } from "date-fns";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { activeStatuses, bookingDto, createToken, hashToken, isWithinBusinessHours, zonedStart } from "@/lib/booking-server";
import { sendBookingNotification } from "@/lib/email";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") || "";
  const reference = (searchParams.get("reference") || "").trim().toUpperCase();
  const email = (searchParams.get("email") || "").trim().toLowerCase();

  if (token) {
    const booking = await prisma.booking.findUnique({ where: { manageTokenHash: hashToken(token) } });
    if (!booking) return NextResponse.json({ error: "This management link is invalid or expired." }, { status: 404 });
    return NextResponse.json({ booking: bookingDto(booking), managementToken: token });
  }

  if (!reference || !email) return NextResponse.json({ error: "Enter your reference and email." }, { status: 400 });
  const found = await prisma.booking.findFirst({ where: { reference, email } });
  if (!found) return NextResponse.json({ error: "We couldn't match those details." }, { status: 404 });

  const managementToken = createToken();
  const booking = await prisma.booking.update({ where: { id: found.id }, data: { manageTokenHash: hashToken(managementToken) } });
  return NextResponse.json({ booking: bookingDto(booking), managementToken });
}

const updateSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("cancel") }),
  z.object({ action: z.literal("reschedule"), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), time: z.string().regex(/^\d{2}:\d{2}$/) }),
]);

export async function PATCH(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!token || !parsed.success) return NextResponse.json({ error: "Invalid booking update." }, { status: 400 });

  const existing = await prisma.booking.findUnique({ where: { manageTokenHash: hashToken(token) } });
  if (!existing) return NextResponse.json({ error: "This management link is invalid or expired." }, { status: 404 });
  if (!activeStatuses().includes(existing.status)) return NextResponse.json({ error: "This booking can no longer be changed." }, { status: 409 });

  try {
    if (parsed.data.action === "cancel") {
      const booking = await prisma.booking.update({
        where: { id: existing.id },
        data: { status: "CANCELLED", events: { create: { type: "CANCELLED", actor: "customer", fromStatus: existing.status, toStatus: "CANCELLED" } } },
      });
      try { await sendBookingNotification(booking, "cancelled"); } catch (error) { console.error("Cancellation email failed", error); }
      return NextResponse.json({ booking: bookingDto(booking), managementToken: token });
    }

    const startAt = zonedStart(parsed.data.date, parsed.data.time);
    const endAt = addMinutes(startAt, existing.duration);
    if (startAt.getTime() <= Date.now() + 15 * 60_000 || !isWithinBusinessHours(startAt, endAt)) {
      return NextResponse.json({ error: "That appointment time is not available." }, { status: 409 });
    }

    const booking = await prisma.$transaction(async (tx) => {
      const conflict = await tx.booking.findFirst({
        where: { id: { not: existing.id }, status: { in: activeStatuses() }, startAt: { lt: endAt }, endAt: { gt: startAt } },
      });
      if (conflict) throw new Error("SLOT_TAKEN");
      return tx.booking.update({
        where: { id: existing.id },
        data: {
          startAt, endAt, status: "PENDING",
          events: { create: { type: "RESCHEDULED", actor: "customer", fromStatus: existing.status, toStatus: "PENDING", details: { previousStartAt: existing.startAt.toISOString() } } },
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    try { await sendBookingNotification(booking, "rescheduled"); } catch (error) { console.error("Reschedule email failed", error); }
    return NextResponse.json({ booking: bookingDto(booking), managementToken: token });
  } catch (error) {
    if ((error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") || (error instanceof Error && error.message === "SLOT_TAKEN")) return NextResponse.json({ error: "That slot has just been taken." }, { status: 409 });
    console.error("Booking update failed", error);
    return NextResponse.json({ error: "We couldn't update the booking." }, { status: 500 });
  }
}
