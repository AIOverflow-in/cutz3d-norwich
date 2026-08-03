import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/dashboard/AdminLoginForm";
import { getAdminSession } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Salon dashboard sign in", robots: { index: false, follow: false } };

export default async function DashboardLoginPage() {
  if (await getAdminSession()) redirect("/dashboard");
  return <><section className="page-hero compact-hero"><div className="shell"><div className="page-badge">Authorised access</div><h1 className="section-title">Manage the chair.</h1><p className="section-copy">Sign in to manage bookings, client details and appointment status.</p></div></section><section className="manage-section"><div className="shell"><div className="manage-lookup"><AdminLoginForm /></div></div></section></>;
}
