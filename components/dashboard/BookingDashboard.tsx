"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Check, ChevronRight, Clock3, Filter, Plus, Search, Scissors, TrendingUp, UserRound, X } from "lucide-react";
import type { Booking, BookingStatus } from "@/lib/data";

const filters: Array<"All" | BookingStatus> = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

function prettyDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

export function BookingDashboard({ initialBookings }: { initialBookings: Booking[] }) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selected) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [selected]);

  const visible = useMemo(() => bookings.filter((item) => {
    const statusMatch = filter === "All" || item.status === filter;
    const haystack = `${item.customerName} ${item.reference} ${item.serviceName} ${item.email} ${item.phone} ${item.date} ${item.time} ${item.notes || ""}`.toLowerCase();
    return statusMatch && haystack.includes(query.toLowerCase());
  }).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)), [bookings, filter, query]);

  const stats = {
    total: bookings.filter((b) => b.status === "Pending" || b.status === "Confirmed").length,
    pending: bookings.filter((b) => b.status === "Pending").length,
    confirmed: bookings.filter((b) => b.status === "Confirmed").length,
    value: bookings.filter((b) => b.status === "Pending" || b.status === "Confirmed").reduce((sum, b) => sum + b.price, 0),
  };

  async function changeStatus(booking: Booking, status: BookingStatus) {
    if (status === "Cancelled" && !window.confirm(`Cancel ${booking.reference} for ${booking.customerName}?`)) return;
    setSaving(true); setError("");
    const response = await fetch("/api/admin/bookings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: booking.id, status: status.toUpperCase() }) });
    const data = await response.json(); setSaving(false);
    if (!response.ok) { setError(data.error || "The booking could not be updated."); return; }
    setBookings((current) => current.map((item) => item.id === booking.id ? data.booking : item));
    setSelected(data.booking);
  }

  return (
    <div className="dashboard-shell">
      <div className="demo-banner"><span>Secure salon workspace</span><strong>Bookings are synced with the live database.</strong><form action="/api/admin/auth/logout" method="post"><button type="submit">Sign out</button></form></div>
      <div className="dashboard-head"><div><div className="eyebrow">Booking desk</div><h1>Appointments</h1><p>Keep the day moving and every client accounted for.</p></div><Link href="/book" className="button button-primary"><Plus size={17} /> New booking</Link></div>
      {error && <div className="form-error" role="alert">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card"><span><CalendarDays /></span><div><small>Upcoming bookings</small><strong>{stats.total}</strong><p>Pending and confirmed</p></div></div>
        <div className="stat-card"><span><Clock3 /></span><div><small>Awaiting confirmation</small><strong>{stats.pending}</strong><p>Needs attention</p></div></div>
        <div className="stat-card"><span><Check /></span><div><small>Confirmed</small><strong>{stats.confirmed}</strong><p>Ready for the chair</p></div></div>
        <div className="stat-card"><span><TrendingUp /></span><div><small>Upcoming value</small><strong>£{stats.value}</strong><p>Pending and confirmed</p></div></div>
      </div>

      <section className="dashboard-card">
        <div className="dashboard-toolbar">
          <div className="status-tabs">{filters.map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}{item !== "All" && <span>{bookings.filter((b) => b.status === item).length}</span>}</button>)}</div>
          <label className="dashboard-search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search bookings" /></label>
        </div>
        <div className="table-wrap">
          <table className="booking-table">
            <thead><tr><th>Client</th><th>Service</th><th>Date & time</th><th>Status</th><th>Value</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>{visible.map((booking) => (
              <tr key={booking.id} tabIndex={0} onClick={() => setSelected(booking)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelected(booking); } }}>
                <td data-label="Client"><div className="client-cell"><span>{booking.customerName.split(" ").map((x) => x[0]).slice(0,2).join("")}</span><div><strong>{booking.customerName}</strong><small>{booking.reference}</small></div></div></td>
                <td data-label="Service"><strong>{booking.serviceName}</strong><small>{booking.duration} min</small></td>
                <td data-label="Date & time"><strong>{prettyDate(booking.date)}</strong><small>{booking.time}</small></td>
                <td data-label="Status"><span className={`status status-${booking.status.toLowerCase()}`}>{booking.status}</span></td>
                <td data-label="Value"><strong>£{booking.price}</strong></td>
                <td><button className="row-action" aria-label={`Open ${booking.reference}`}><ChevronRight size={17} /></button></td>
              </tr>
            ))}</tbody>
          </table>
          {visible.length === 0 && <div className="empty-state"><Filter size={28} /><h3>No bookings here</h3><p>Try a different status or search term.</p></div>}
        </div>
      </section>

      {selected && <div className="drawer-backdrop" onMouseDown={(e) => { if (e.currentTarget === e.target) setSelected(null); }}><aside className="booking-drawer" role="dialog" aria-modal="true" aria-labelledby="booking-drawer-title"><div className="drawer-head"><div><span className={`status status-${selected.status.toLowerCase()}`}>{selected.status}</span><h2 id="booking-drawer-title">{selected.reference}</h2></div><button autoFocus onClick={() => setSelected(null)} aria-label="Close booking"><X /></button></div><div className="drawer-client"><span><UserRound /></span><div><strong>{selected.customerName}</strong><small>{selected.email}<br />{selected.phone}</small></div></div><div className="drawer-section"><div className="drawer-label">Appointment</div><div className="drawer-service"><Scissors /><div><strong>{selected.serviceName}</strong><small>{selected.duration} minutes · £{selected.price}</small></div></div><dl><div><dt>Date</dt><dd>{prettyDate(selected.date)}</dd></div><div><dt>Time</dt><dd>{selected.time}</dd></div><div><dt>Booked</dt><dd>{new Date(selected.createdAt).toLocaleDateString("en-GB")}</dd></div></dl></div>{selected.notes && <div className="drawer-section"><div className="drawer-label">Client notes</div><p className="drawer-notes">{selected.notes}</p></div>}<div className="drawer-actions">{selected.status === "Pending" && <button disabled={saving} className="button button-primary" onClick={() => changeStatus(selected, "Confirmed")}><Check size={16} /> Confirm booking</button>}{selected.status === "Confirmed" && <button disabled={saving} className="button button-primary" onClick={() => changeStatus(selected, "Completed")}><Check size={16} /> Mark complete</button>}{selected.status !== "Cancelled" && selected.status !== "Completed" && <button disabled={saving} className="button cancel-button" onClick={() => changeStatus(selected, "Cancelled")}><X size={16} /> Cancel</button>}</div></aside></div>}
    </div>
  );
}
