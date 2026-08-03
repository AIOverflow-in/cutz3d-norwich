"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, Clock3, Mail, MapPin, Scissors, ShieldCheck } from "lucide-react";
import { services } from "@/lib/data";
import type { Booking } from "@/lib/data";
import { fullAddress } from "@/lib/site";

const slots = ["09:00", "09:45", "10:30", "11:15", "12:00", "13:00", "13:45", "14:30", "15:15", "16:00", "16:45", "17:30"];

function londonNow() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value || 0);
  return { date: `${value("year")}-${String(value("month")).padStart(2, "0")}-${String(value("day")).padStart(2, "0")}`, minutes: value("hour") * 60 + value("minute") };
}

function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function prettyDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(year, month - 1, day));
}

export function BookingFlow({ initialService }: { initialService?: string }) {
  const [step, setStep] = useState(initialService && services.some((s) => s.id === initialService) ? 2 : 1);
  const [serviceId, setServiceId] = useState(initialService || "");
  const now = useMemo(() => londonNow(), []);
  const dates = useMemo(() => Array.from({ length: 8 }, (_, index) => { const day = new Date(`${now.date}T12:00:00Z`); day.setUTCDate(day.getUTCDate() + index); return isoDate(day); }), [now.date]);
  const [date, setDate] = useState(dates[0]);
  const [time, setTime] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState<Booking | null>(null);
  const [managementToken, setManagementToken] = useState("");
  const [availability, setAvailability] = useState<{ key: string; slots: string[] }>({ key: "", slots: [] });
  const [submitting, setSubmitting] = useState(false);
  const selected = services.find((service) => service.id === serviceId);
  const availabilityKey = selected ? `${date}:${selected.duration}` : "";
  const availableSlots = availability.key === availabilityKey ? availability.slots : [];
  const loadingSlots = step === 2 && Boolean(selected) && availability.key !== availabilityKey;

  useEffect(() => {
    if (step !== 2 || !selected) return;
    const controller = new AbortController();
    fetch(`/api/availability?date=${encodeURIComponent(date)}&duration=${selected.duration}`, { signal: controller.signal })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); return data; })
      .then((data) => setAvailability({ key: `${date}:${selected.duration}`, slots: data.slots }))
      .catch((fetchError) => { if (fetchError.name !== "AbortError") setError("Available times couldn't be loaded. Please try again."); })
    return () => controller.abort();
  }, [date, selected, step]);

  function next() {
    if (step === 1 && !selected) return setError("Choose a service to continue.");
    if (step === 2 && !time) return setError("Choose an available time to continue.");
    setError(""); setStep((current) => Math.min(3, current + 1)); requestAnimationFrame(() => document.querySelector(".booking-steps")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    const phoneValid = form.phone.replace(/\D/g, "").length >= 10;
    if (!selected || !time || form.name.trim().length < 2 || !emailValid || !phoneValid) return setError("Enter a valid full name, email address and UK phone number.");
    setSubmitting(true); setError("");
    const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ serviceId: selected.id, date, time, customerName: form.name, email: form.email, phone: form.phone, notes: form.notes }) });
    const data = await response.json(); setSubmitting(false);
    if (!response.ok) { setError(data.error || "We couldn't save your booking. Please try again."); if (response.status === 409) setStep(2); return; }
    setDone(data.booking); setManagementToken(data.managementToken); setStep(4); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (step === 4 && done) {
    return (
      <div className="booking-success">
        <span className="success-icon"><CheckCircle2 size={44} /></span>
        <div className="page-badge">Booking request received</div>
        <h2>Request sent.</h2>
        <p>Your appointment is awaiting confirmation. Keep your reference handy if you need to make a change.</p>
        <div className="confirmation-card">
          <div className="confirmation-top"><span>Booking reference</span><strong>{done.reference}</strong></div>
          <div className="confirmation-grid">
            <div><span>Service</span><strong>{done.serviceName}</strong></div>
            <div><span>Date</span><strong>{prettyDate(done.date)}</strong></div>
            <div><span>Time</span><strong>{done.time}</strong></div>
            <div><span>Estimated total</span><strong>£{done.price}</strong></div>
          </div>
          <div className="confirmation-location"><MapPin size={18} /> {fullAddress}</div>
        </div>
        <div className="success-actions"><Link href={`/manage?token=${encodeURIComponent(managementToken)}`} className="button button-primary">Manage this booking</Link><Link href="/" className="button button-dark">Back to home</Link></div>
        <div className="success-note"><Mail size={17} /><span>The salon has been notified. Your booking is awaiting confirmation.</span></div>
      </div>
    );
  }

  return (
    <div className="booking-layout">
      <div className="booking-main">
        <div className="booking-steps" aria-label="Booking progress">
          {["Service", "Date & time", "Your details"].map((label, index) => <div key={label} aria-current={step === index + 1 ? "step" : undefined} className={`booking-step ${step >= index + 1 ? "active" : ""}`}><span>{step > index + 1 ? <Check size={14} /> : index + 1}</span><strong>{label}</strong></div>)}
        </div>

        {step === 1 && (
          <section className="booking-panel">
            <div className="booking-panel-head"><span className="panel-icon"><Scissors /></span><div><h2>What are we doing?</h2><p>Select one service for this appointment.</p></div></div>
            <div className="service-options">
              {services.map((service) => (
                <button key={service.id} aria-pressed={serviceId === service.id} className={`service-option ${serviceId === service.id ? "selected" : ""}`} onClick={() => { setServiceId(service.id); setAvailability({ key: "", slots: [] }); setTime(""); setError(""); }}>
                  <span className="service-check">{serviceId === service.id && <Check size={16} />}</span>
                  <span className="service-option-copy"><strong>{service.name}{service.popular && <em>Popular</em>}</strong><small>{service.description}</small><span><Clock3 size={13} /> {service.duration} min</span></span>
                  <b>£{service.price}</b>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="booking-panel">
            <div className="booking-panel-head"><span className="panel-icon"><CalendarDays /></span><div><h2>When suits you?</h2><p>Choose a day, then an available start time.</p></div></div>
            <div className="date-strip">
              {dates.map((item) => { const d = new Date(`${item}T12:00:00`); return <button key={item} aria-pressed={date === item} className={date === item ? "selected" : ""} onClick={() => { setDate(item); setTime(""); }}><span>{d.toLocaleDateString("en-GB", { weekday: "short" })}</span><strong>{d.getDate()}</strong><small>{d.toLocaleDateString("en-GB", { month: "short" })}</small></button>; })}
            </div>
            <div className="time-heading"><strong>{prettyDate(date)}</strong><span><span className="availability-dot" /> Available times</span></div>
            {loadingSlots ? <p className="availability-message">Checking the chair…</p> : availableSlots.length === 0 ? <p className="availability-message">No appointments are available on this day. Try another date.</p> : <div className="time-grid">{slots.map((slot) => <button key={slot} disabled={!availableSlots.includes(slot)} aria-pressed={time === slot} className={time === slot ? "selected" : ""} onClick={() => { setTime(slot); setError(""); }}>{slot}</button>)}</div>}
          </section>
        )}

        {step === 3 && (
          <form id="booking-details" className="booking-panel" onSubmit={submit}>
            <div className="booking-panel-head"><span className="panel-icon"><ShieldCheck /></span><div><h2>Last few details.</h2><p>We&apos;ll use these details for your booking confirmation.</p></div></div>
            <div className="field-grid"><label><span className="form-label">Full name *</span><input className="input" autoComplete="name" required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></label><label><span className="form-label">Mobile number *</span><input className="input" autoComplete="tel" type="tel" required inputMode="tel" pattern="[+0-9][0-9 ()-]{7,}" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="07..." /></label></div>
            <label style={{ display: "block", marginTop: 16 }}><span className="form-label">Email address *</span><input className="input" autoComplete="email" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label>
            <label style={{ display: "block", marginTop: 16 }}><span className="form-label">Anything we should know? <span className="muted">(optional)</span></span><textarea className="textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Hair length, style reference or accessibility needs..." /></label>
            <p className="privacy-note"><ShieldCheck size={15} /> Your details are used only to manage this appointment.</p>
          </form>
        )}

        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="booking-nav">
          {step > 1 ? <button className="button button-light" onClick={() => { setStep(step - 1); setError(""); }}><ArrowLeft size={17} /> Back</button> : <span />}
          {step < 3 ? <button className="button button-dark" onClick={next}>Continue <ArrowRight size={17} /></button> : <button className="button button-primary" disabled={submitting} type="submit" form="booking-details">{submitting ? "Saving…" : "Request booking"} <Check size={17} /></button>}
        </div>
      </div>

      <aside className="booking-summary">
        <div className="summary-label">Your appointment</div>
        {selected ? <><div className="summary-service"><span className="summary-icon"><Scissors size={19} /></span><div><strong>{selected.name}</strong><small>{selected.duration} minutes</small></div><b>£{selected.price}</b></div></> : <div className="summary-empty">Choose a service to see your appointment summary.</div>}
        {step >= 2 && time && <div className="summary-row"><CalendarDays size={17} /><span>{prettyDate(date)} at {time}</span></div>}
        <div className="summary-row"><MapPin size={17} /><span>{fullAddress}</span></div>
        <div className="summary-total"><span>Estimated total</span><strong>{selected ? `£${selected.price}` : "—"}</strong></div>
        <p>No payment is taken online. Final price is confirmed by the salon.</p>
      </aside>
    </div>
  );
}
