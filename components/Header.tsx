"use client";

import Link from "next/link";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/#services", label: "Services" },
  { href: "/#about", label: "About" },
  { href: "/blog", label: "Journal" },
  { href: "/manage", label: "Manage booking" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <span className="header-wordmark"><span>3D</span><strong>CUTZ</strong></span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={pathname === link.href ? "active" : ""}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/book" className="button button-sm button-dark">
            Book a cut <ArrowUpRight size={16} />
          </Link>
          <button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
          <Link href="/book" className="button button-primary" onClick={() => setOpen(false)}>Book a cut</Link>
        </nav>
      )}
    </header>
  );
}
