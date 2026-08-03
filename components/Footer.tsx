import Link from "next/link";
import { ArrowUpRight, Instagram, MapPin } from "lucide-react";
import { SITE, fullAddress } from "@/lib/site";

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-grid">
        <div className="footer-intro">
          <Link href="/" className="footer-wordmark">
            <span>3D</span><strong>CUTZ</strong>
          </Link>
          <p>Precision barbering, right in the heart of Norwich.</p>
          <Link href="/book" className="button button-primary">Book your chair <ArrowUpRight size={17} /></Link>
        </div>
        <div>
          <div className="footer-label">Explore</div>
          <div className="footer-links">
            <Link href="/#services">Services</Link><Link href="/blog">Journal</Link>
            <Link href="/manage">Manage booking</Link>
          </div>
        </div>
        <div>
          <div className="footer-label">Find us</div>
          <a className="footer-address" href={SITE.social.google} target="_blank" rel="noreferrer"><MapPin size={18} /> {fullAddress}</a>
          <a className="social-link" href={SITE.social.instagram} target="_blank" rel="noreferrer"><Instagram size={18} /> @3d.cutz.norwich</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} {SITE.legalName}. Company no. {SITE.companyNumber}.</span>
        <span>Norwich, Norfolk</span>
      </div>
    </footer>
  );
}
