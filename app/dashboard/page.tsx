import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BookingDashboard } from "@/components/dashboard/BookingDashboard";
import { getAdminSession } from "@/lib/admin-auth";
import { bookingDto } from "@/lib/booking-server";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Booking dashboard", description: "3D Cutz booking management interface.", robots: { index: false, follow: false } };

export default async function DashboardPage() {
  if (!await getAdminSession()) redirect("/dashboard/login");
  const bookings = await prisma.booking.findMany({ orderBy: { startAt: "asc" } });
  return <section className="dashboard-page"><div className="shell"><BookingDashboard initialBookings={bookings.map(bookingDto)} /></div></section>;
}
