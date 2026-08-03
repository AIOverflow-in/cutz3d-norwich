import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return <section className="section"><div className="shell" style={{ textAlign: "center", maxWidth: 760 }}><div className="page-badge">404</div><h1 className="section-title">This page<br />missed the chair.</h1><p className="section-copy" style={{ marginInline: "auto" }}>The page you were looking for has moved or does not exist.</p><Link href="/" className="button button-dark" style={{ marginTop: 28 }}><ArrowLeft size={17} /> Back home</Link></div></section>;
}
