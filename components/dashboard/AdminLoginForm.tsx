"use client";

import { useState } from "react";
import { Mail, ShieldCheck } from "lucide-react";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    const response = await fetch("/api/admin/auth/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const data = await response.json(); setLoading(false);
    if (!response.ok) return setError(data.error || "Unable to send the sign-in link.");
    setMessage(data.message);
  }

  return <div className="lookup-card admin-login-card"><span className="lookup-icon"><ShieldCheck size={28} /></span><h2>Salon dashboard</h2><p>Enter the authorised email and we&apos;ll send a secure, one-time sign-in link.</p><form onSubmit={submit}><label><span className="form-label">Admin email</span><input className="input" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>{error && <div className="form-error" role="alert">{error}</div>}{message && <div className="manage-message"><Mail size={17} /> {message}</div>}<button className="button button-primary" disabled={loading} type="submit">{loading ? "Sending…" : "Email my secure link"} <Mail size={17} /></button></form></div>;
}
