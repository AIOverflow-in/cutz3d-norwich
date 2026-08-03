import { NextResponse } from "next/server";
import { addMinutes } from "date-fns";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { services } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { activeStatuses, bookingDto, createReference, createToken, hashToken, isWithinBusinessHours, zonedStart } from "@/lib/booking-server";
import { sendBookingNotification } from "@/lib/email";

const bookingSchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  customerName: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(160),
  phone: z.string().trim().min(8).max(30),
  notes: z.string().trim().max(800).optional().default(""),
});

export async function POST(request: Request) {
  const parsed = bookingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the booking details and try again." }, { status: 400 });

  const service = services.find((item) => item.id === parsed.data.serviceId);
  if (!service) return NextResponse.json({ error: "That service is no longer available." }, { status: 400 });

  const startAt = zonedStart(parsed.data.date, parsed.data.time);
  const endAt = addMinutes(startAt, service.duration);
  if (startAt.getTime() <= Date.now() + 15 * 60_000 || !isWithinBusinessHours(startAt, endAt)) {
    return NextResponse.json({ error: "That appointment time is not available." }, { status: 409 });
  }

  const managementToken = createToken();
  try {
    const booking = await prisma.$transaction(async (tx) => {
      const conflict = await tx.booking.findFirst({
        where: { status: { in: activeStatuses() }, startAt: { lt: endAt }, endAt: { gt: startAt } },
        select: { id: true },
      });
      if (conflict) throw new Error("SLOT_TAKEN");

      return tx.booking.create({
        data: {
          reference: createReference(), manageTokenHash: hashToken(managementToken),
          customerName: parsed.data.customerName, email: parsed.data.email, phone: parsed.data.phone,
          serviceId: service.id, serviceName: service.name, price: service.price, duration: service.duration,
          startAt, endAt, notes: parsed.data.notes || null,
          events: { create: { type: "CREATED", actor: "customer", toStatus: "PENDING", details: { source: "website" } } },
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    try {
      const email = await sendBookingNotification(booking, "created");
      if (email.sent) await prisma.booking.update({ where: { id: booking.id }, data: { notifiedAt: new Date() } });
    } catch (error) {
      console.error("Booking email failed", error);
    }

    return NextResponse.json({ booking: bookingDto(booking), managementToken }, { status: 201 });
  } catch (error) {
    if ((error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") || (error instanceof Error && (error.message === "SLOT_TAKEN" || error.message.includes("could not serialize")))) {
      return NextResponse.json({ error: "That slot has just been taken. Please choose another time." }, { status: 409 });
    }
    console.error("Booking creation failed", error);
    return NextResponse.json({ error: "We couldn't save the booking. Please try again." }, { status: 500 });
  }
}
