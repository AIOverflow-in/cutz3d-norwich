import { Resend } from "resend";
import type { Booking as DbBooking } from "@prisma/client";
import { formatInTimeZone } from "date-fns-tz";
import { SALON_TIMEZONE, statusLabel } from "./booking-server";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character] || character);
}

export async function sendBookingNotification(booking: DbBooking, event: "created" | "rescheduled" | "cancelled" | "status") {
  const to = process.env.BOOKING_NOTIFY_EMAIL;
  const from = process.env.EMAIL_FROM;
  if (!resend || !to || !from) return { sent: false, reason: "Email is not configured" };

  const when = formatInTimeZone(booking.startAt, SALON_TIMEZONE, "EEEE d MMMM yyyy 'at' HH:mm");
  const subject = event === "created" ? `New booking request · ${booking.reference}` : `Booking ${event} · ${booking.reference}`;
  const text = `${subject}\n\n${booking.customerName}\n${booking.serviceName}\n${when}\n${booking.phone}\n${booking.email}\nStatus: ${statusLabel(booking.status)}${booking.notes ? `\nNotes: ${booking.notes}` : ""}`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#0c0d0c"><div style="background:#72ec31;padding:18px 22px;font-size:24px;font-weight:900">3D CUTZ</div><div style="padding:24px;border:1px solid #e1e4dd"><p style="margin:0 0 6px;color:#667066;font-size:12px;text-transform:uppercase">${escapeHtml(event)}</p><h1 style="margin:0 0 22px;font-size:24px">${escapeHtml(booking.reference)}</h1><p><strong>${escapeHtml(booking.customerName)}</strong><br>${escapeHtml(booking.phone)}<br>${escapeHtml(booking.email)}</p><p><strong>${escapeHtml(booking.serviceName)}</strong><br>${escapeHtml(when)}<br>£${booking.price}</p><p>Status: <strong>${escapeHtml(statusLabel(booking.status))}</strong></p>${booking.notes ? `<p style="background:#f4f5f0;padding:12px">${escapeHtml(booking.notes)}</p>` : ""}</div></div>`;

  const result = await resend.emails.send({ from, to: [to], replyTo: process.env.BOOKING_REPLY_TO || undefined, subject, text, html });
  if (result.error) throw new Error(result.error.message);
  return { sent: true, id: result.data?.id };
}

export async function sendAdminLoginEmail(email: string, loginUrl: string) {
  const from = process.env.EMAIL_FROM;
  if (!resend || !from) throw new Error("Email is not configured");
  const result = await resend.emails.send({
    from,
    to: [email],
    subject: "Your secure 3D Cutz dashboard link",
    text: `Open this one-time link to sign in to the 3D Cutz dashboard. It expires in 15 minutes:\n\n${loginUrl}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0c0d0c"><div style="background:#72ec31;padding:18px 22px;font-size:24px;font-weight:900">3D CUTZ</div><div style="padding:24px;border:1px solid #e1e4dd"><h1 style="font-size:24px">Dashboard sign-in</h1><p>This secure, one-time link expires in 15 minutes.</p><p style="margin:28px 0"><a href="${escapeHtml(loginUrl)}" style="background:#0c0d0c;color:#fff;padding:14px 20px;border-radius:999px;text-decoration:none;font-weight:700">Open booking dashboard</a></p><p style="font-size:13px;color:#667066">If you did not request this link, you can ignore this email.</p></div></div>`,
  });
  if (result.error) throw new Error(result.error.message);
  return result.data;
}
