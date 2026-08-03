import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { bookingDto } from "@/lib/booking-server";
import { sendBookingNotification } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const schema = z.object({ id: z.string().min(1), status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]) });

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Unauthorised" }, { status: 401 }); }
  const bookings = await prisma.booking.findMany({ orderBy: { startAt: "asc" } });
  return NextResponse.json({ bookings: bookings.map(bookingDto) });
}

export async function PATCH(request: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Unauthorised" }, { status: 401 }); }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  const previous = await prisma.booking.findUnique({ where: { id: parsed.data.id } });
  if (!previous) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  const booking = await prisma.booking.update({
    where: { id: previous.id },
    data: { status: parsed.data.status, events: { create: { type: "STATUS_CHANGED", actor: "admin", fromStatus: previous.status, toStatus: parsed.data.status } } },
  });
  try { await sendBookingNotification(booking, "status"); } catch (error) { console.error("Status email failed", error); }
  return NextResponse.json({ booking: bookingDto(booking) });
}
