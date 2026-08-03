import type { Metadata } from "next";
import { ManageBooking } from "@/components/booking/ManageBooking";

export const metadata: Metadata = { title: "Manage your booking", description: "View, reschedule or cancel your 3D Cutz Norwich barber appointment online.", alternates: { canonical: "/manage" }, robots: { index: false, follow: true } };

export default async function ManagePage({ searchParams }: { searchParams: Promise<{ ref?: string; email?: string; token?: string }> }) {
  const params = await searchParams;
  return <><section className="page-hero"><div className="shell"><div className="page-badge">Your appointment</div><h1 className="section-title">Plans change.<br />No problem.</h1><p className="section-copy">Check the details, choose a different time or cancel your appointment.</p></div></section><section className="manage-section"><div className="shell"><ManageBooking initialRef={params.ref} initialEmail={params.email} initialToken={params.token} /></div></section></>;
}
