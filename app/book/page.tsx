import type { Metadata } from "next";
import { BookingFlow } from "@/components/booking/BookingFlow";

export const metadata: Metadata = { title: "Book a barber appointment", description: "Book a skin fade, taper fade, haircut or beard trim at 3D Cutz on Prince of Wales Road, Norwich.", alternates: { canonical: "/book" } };

export default async function BookPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const params = await searchParams;
  return <><section className="page-hero"><div className="shell"><div className="page-badge">Online booking</div><h1 className="section-title">Book your<br />next cut.</h1><p className="section-copy">Choose your service and a time that works. It takes less than a minute.</p></div></section><section className="booking-section"><div className="shell"><BookingFlow initialService={params.service} /></div></section></>;
}
