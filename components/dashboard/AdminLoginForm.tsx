"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, ShieldCheck } from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    const response = await fetch("/api/admin/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await response.json(); setLoading(false);
    if (!response.ok) return setError(data.error || "Unable to sign in.");
    router.replace("/dashboard");
    router.refresh();
  }

  return <div className="lookup-card admin-login-card"><span className="lookup-icon"><ShieldCheck size={28} /></span><h2>Salon dashboard</h2><p>Sign in with the authorised salon account.</p><form onSubmit={submit}><label><span className="form-label">Admin email</span><input className="input" type="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label><label><span className="form-label">Password</span><input className="input" type="password" required minLength={8} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="button button-primary" disabled={loading} type="submit">{loading ? "Signing in…" : "Sign in"} <LogIn size={17} /></button></form></div>;
}
