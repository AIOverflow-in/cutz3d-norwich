"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, CalendarDays, Check, Clock3, MapPin, RotateCcw, Scissors, Search, X } from "lucide-react";
import type { Booking } from "@/lib/data";
import { fullAddress } from "@/lib/site";

const times = ["09:00", "09:45", "10:30", "11:15", "12:00", "13:00", "13:45", "14:30", "15:15", "16:00", "16:45"];

function futureDates() {
  return Array.from({ length: 7 }, (_, index) => { const d = new Date(); d.setDate(d.getDate() + index + 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; });
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}

export function ManageBooking({ initialRef = "", initialEmail = "", initialToken = "" }: { initialRef?: string; initialEmail?: string; initialToken?: string }) {
  const [reference, setReference] = useState(initialRef);
  const [email, setEmail] = useState(initialEmail);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [managementToken, setManagementToken] = useState(initialToken);
  const [loading, setLoading] = useState(Boolean(initialToken));
  const [availability, setAvailability] = useState<{ key: string; slots: string[] }>({ key: "", slots: [] });
  const dates = futureDates();
  const [newDate, setNewDate] = useState(dates[0]);
  const [newTime, setNewTime] = useState("");
  const availabilityKey = booking ? `${newDate}:${booking.duration}` : "";
  const availableTimes = availability.key === availabilityKey ? availability.slots : [];

  useEffect(() => {
    if (!initialToken) return;
    const controller = new AbortController();
    fetch(`/api/bookings/manage?token=${encodeURIComponent(initialToken)}`, { signal: controller.signal })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); return data; })
      .then((data) => { setBooking(data.booking); setManagementToken(data.managementToken); })
      .catch((fetchError) => { if (fetchError.name !== "AbortError") setMessage(fetchError.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [initialToken]);

  useEffect(() => {
    if (!editing || !booking) return;
    const controller = new AbortController();
    fetch(`/api/availability?date=${encodeURIComponent(newDate)}&duration=${booking.duration}`, { signal: controller.signal })
      .then((response) => response.json()).then((data) => setAvailability({ key: `${newDate}:${booking.duration}`, slots: data.slots || [] }))
      .catch((fetchError) => { if (fetchError.name !== "AbortError") setMessage("Available times couldn't be loaded."); });
    return () => controller.abort();
  }, [booking, editing, newDate]);

  async function findBooking(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true); setMessage("");
    const response = await fetch(`/api/bookings/manage?reference=${encodeURIComponent(reference)}&email=${encodeURIComponent(email)}`);
    const data = await response.json(); setLoading(false);
    if (!response.ok) { setBooking(null); setMessage(data.error || "We couldn't match those details."); return; }
    setBooking(data.booking); setManagementToken(data.managementToken); setMessage(""); setEditing(false);
    window.history.replaceState({}, "", `/manage?token=${encodeURIComponent(data.managementToken)}`);
  }

  async function saveReschedule() {
    if (!booking || !newTime) return setMessage("Choose a new time before saving.");
    setLoading(true); setMessage("");
    const response = await fetch(`/api/bookings/manage?token=${encodeURIComponent(managementToken)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reschedule", date: newDate, time: newTime }) });
    const data = await response.json(); setLoading(false);
    if (!response.ok) return setMessage(data.error || "We couldn't reschedule the booking.");
    setBooking(data.booking); setEditing(false); setMessage("Your new time has been requested.");
  }

  async function cancel() {
    if (!booking || !window.confirm("Cancel this booking? This action takes effect immediately.")) return;
    setLoading(true);
    const response = await fetch(`/api/bookings/manage?token=${encodeURIComponent(managementToken)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "cancel" }) });
    const data = await response.json(); setLoading(false);
    if (!response.ok) return setMessage(data.error || "We couldn't cancel the booking.");
    setBooking(data.booking); setEditing(false); setMessage("This booking has been cancelled.");
  }

  if (loading && !booking) return <div className="manage-lookup"><div className="lookup-card"><h2>Loading your booking…</h2><p>Please wait a moment.</p></div></div>;

  if (!booking) {
    return (
      <div className="manage-lookup">
        <div className="lookup-card">
          <span className="lookup-icon"><Search size={28} /></span>
          <h2>Find your booking</h2><p>Enter the reference from your confirmation and the email used to book.</p>
          <form onSubmit={findBooking}>
            <label><span className="form-label">Booking reference</span><input className="input" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. 3D-2408" /></label>
            <label><span className="form-label">Email address</span><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label>
            {message && <div className="form-error">{message}</div>}
            <button className="button button-primary" disabled={loading} type="submit">{loading ? "Searching…" : "Find booking"} <Search size={17} /></button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-result">
      <button className="back-link" onClick={() => { setBooking(null); setMessage(""); }}><ArrowLeft size={16} /> Search another booking</button>
      <div className="manage-card">
        <div className="manage-card-head"><div><span className={`status status-${booking.status.toLowerCase()}`}>{booking.status}</span><h2>{booking.customerName}&apos;s appointment</h2><p>Reference {booking.reference}</p></div><span className="large-ref">{booking.reference}</span></div>
        <div className="appointment-hero"><span><Scissors size={25} /></span><div><small>Service</small><strong>{booking.serviceName}</strong><p>{booking.duration} minutes · £{booking.price}</p></div></div>
        {!editing ? (
          <>
            <div className="appointment-details">
              <div><CalendarDays /><span><small>Date</small><strong>{formatDate(booking.date)}</strong></span></div>
              <div><Clock3 /><span><small>Time</small><strong>{booking.time}</strong></span></div>
              <div><MapPin /><span><small>Location</small><strong>{fullAddress}</strong></span></div>
            </div>
            {message && booking.status !== "Cancelled" && <div className="manage-message"><Check size={17} /> {message}</div>}
            {(booking.status === "Pending" || booking.status === "Confirmed") ? <div className="manage-actions"><button className="button button-primary" onClick={() => { setEditing(true); setMessage(""); }}><RotateCcw size={16} /> Reschedule</button><button className="button cancel-button" onClick={cancel}><X size={16} /> Cancel booking</button></div> : booking.status === "Cancelled" ? <div className="cancelled-note"><AlertTriangle size={18} /> This booking is cancelled. <Link href="/book">Make a new booking</Link></div> : <div className="completed-note"><Check size={18} /> This appointment is complete. <Link href="/book">Book another visit</Link></div>}
          </>
        ) : (
          <div className="reschedule-panel">
            <h3>Choose a new appointment</h3><p>Your original slot stays in place until you save the new request.</p>
            <div className="reschedule-dates">{dates.map((date) => <button key={date} className={newDate === date ? "selected" : ""} onClick={() => { setNewDate(date); setNewTime(""); }}><span>{new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short" })}</span><strong>{new Date(`${date}T12:00:00`).getDate()}</strong></button>)}</div>
            <div className="time-grid">{times.map((time) => <button key={time} disabled={!availableTimes.includes(time)} className={newTime === time ? "selected" : ""} onClick={() => setNewTime(time)}>{time}</button>)}</div>
            {message && <div className="form-error">{message}</div>}
            <div className="manage-actions"><button className="button button-primary" disabled={loading} onClick={saveReschedule}><Check size={16} /> {loading ? "Saving…" : "Save new time"}</button><button className="button button-light" onClick={() => { setEditing(false); setMessage(""); }}>Keep original</button></div>
          </div>
        )}
      </div>
    </div>
  );
}
