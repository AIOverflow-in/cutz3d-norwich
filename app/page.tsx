import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, Award, CalendarCheck, Check, Clock3,
  Instagram, MapPin, Navigation, Scissors, ShieldCheck, Sparkles, Users,
} from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { faqs, services } from "@/lib/data";
import { SITE, fullAddress } from "@/lib/site";

const articles = [
  { slug: "skin-fade-norwich-guide", title: "The Norwich guide to a sharper skin fade", category: "Fade guide", date: "30 Jul 2026", image: "/images/skin-fade.webp", excerpt: "What to ask for, how often to refresh it, and how to keep the finish clean between appointments." },
  { slug: "taper-vs-skin-fade", title: "Taper fade vs skin fade: which cut fits you?", category: "Barber advice", date: "23 Jul 2026", image: "/images/craft.webp", excerpt: "A simple breakdown of two modern favourites, including maintenance and styling." },
  { slug: "beard-shape-face-guide", title: "How to choose a beard shape for your face", category: "Grooming", date: "16 Jul 2026", image: "/images/tools.webp", excerpt: "Balance your features with the right length, outline and cheek line." },
];

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "HairSalon",
  "@id": `${SITE.url}/#barbershop`,
  name: SITE.name,
  legalName: SITE.legalName,
  description: SITE.description,
  url: SITE.url,
  logo: `${SITE.url}/images/cutz3d-logo.webp`,
  image: [`${SITE.url}/images/hero-barber.webp`, `${SITE.url}/images/studio.webp`],
  priceRange: "££",
  currenciesAccepted: "GBP",
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.address.street,
    addressLocality: SITE.address.city,
    addressRegion: SITE.address.county,
    postalCode: SITE.address.postcode,
    addressCountry: SITE.address.country,
  },
  geo: { "@type": "GeoCoordinates", latitude: SITE.address.lat, longitude: SITE.address.lng },
  sameAs: [SITE.social.instagram, SITE.social.facebook, SITE.social.google],
  areaServed: [{ "@type": "City", name: "Norwich" }, { "@type": "AdministrativeArea", name: "Norfolk" }],
  hasMap: SITE.social.google,
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={localBusinessSchema} />
      <JsonLd data={faqSchema} />

      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <div className="hero-kicker"><span className="pulse" /> Norwich city centre barber</div>
            <h1 className="display">Look sharp.<br />Feel <span style={{ color: "var(--acid-deep)" }}>3D.</span></h1>
            <p>Precision fades, clean cuts and detailed beard work—crafted for you in the heart of Norwich. Your next sharp look is only a few clicks away.</p>
            <div className="hero-actions">
              <Link href="/book" className="button button-primary button-wide">Book your cut <ArrowUpRight size={18} /></Link>
              <Link href="#services" className="button button-dark button-wide">View services</Link>
            </div>
            <div className="hero-proof">
              <div><div className="proof-number">13K</div><div className="proof-label">Instagram community</div></div>
              <span className="proof-divider" />
              <div><div className="proof-number">NR1</div><div className="proof-label">Norwich city centre</div></div>
              <span className="proof-divider" />
              <div><div className="proof-number">24/7</div><div className="proof-label">Online booking</div></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-frame"><Image src="/images/hero-barber.webp" alt="Barber finishing a precise haircut" fill priority sizes="(max-width: 980px) 100vw, 50vw" /></div>
            <div className="hero-card">
              <div className="hero-card-top"><span>Book online</span><Check size={15} color="#49c80a" /></div>
              <div className="hero-card-time">Pick your time</div>
              <small>Simple · quick · easy to manage</small>
            </div>
            <div className="hero-sticker"><strong>Fresh.</strong><span>Every angle · every detail</span></div>
          </div>
        </div>
      </section>

      <div className="trust-bar">
        <div className="shell trust-grid">
          <div className="trust-item"><span className="trust-icon"><Scissors size={19} /></span><div><strong>Precision cuts</strong><span>Detail in every finish</span></div></div>
          <div className="trust-item"><span className="trust-icon"><CalendarCheck size={19} /></span><div><strong>Book in seconds</strong><span>Choose a time that fits</span></div></div>
          <div className="trust-item"><span className="trust-icon"><MapPin size={19} /></span><div><strong>City centre</strong><span>Prince of Wales Road</span></div></div>
          <div className="trust-item"><span className="trust-icon"><ShieldCheck size={19} /></span><div><strong>Easy to manage</strong><span>Reschedule online</span></div></div>
        </div>
      </div>

      <section className="section" id="services">
        <div className="shell">
          <div className="section-head">
            <div><div className="eyebrow">Services</div><h2 className="section-title">Pick your<br />fresh look.</h2></div>
            <div><p className="section-copy">Straightforward barbering with no guesswork. Choose your service, lock in your time and arrive ready.</p><Link href="/book" className="text-link">Book a service <ArrowRight size={17} /></Link></div>
          </div>
          <div className="services-grid">
            {services.slice(0, 6).map((service, index) => (
              <Link href={`/book?service=${service.id}`} className="service-row" key={service.id}>
                <span className="service-number">{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{service.name}</h3><p>{service.description}</p></div>
                <div className="service-price"><strong>from £{service.price}</strong><span>{service.duration} min</span></div>
              </Link>
            ))}
          </div>
          <p className="service-note">Indicative demo prices—final menu to be confirmed before launch.</p>
        </div>
      </section>

      <section className="section section-dark" id="about">
        <div className="shell craft-grid">
          <div className="craft-collage">
            <div className="craft-main"><Image src="/images/studio.webp" alt="Modern barber studio interior" fill sizes="(max-width: 980px) 100vw, 50vw" /></div>
            <div className="craft-small"><Image src="/images/skin-fade.webp" alt="Close detail of a fade haircut" fill sizes="(max-width: 700px) 55vw, 25vw" /></div>
            <div className="craft-tag">Built around the details</div>
          </div>
          <div>
            <div className="eyebrow">The 3D standard</div>
            <h2 className="section-title">Good from every angle.</h2>
            <p className="section-copy">Your cut should hold up beyond the chair. We focus on clean structure, a considered shape and the small details that make the whole look work.</p>
            <div className="feature-list">
              <div className="feature"><span className="feature-icon"><Sparkles size={21} /></span><div><h3>A finish made for you</h3><p>We start with how you wear your hair, then tailor the shape, blend and finish.</p></div></div>
              <div className="feature"><span className="feature-icon"><Award size={21} /></span><div><h3>Modern craft, sharp detail</h3><p>From skin fades to beard lines, every angle gets the same attention.</p></div></div>
              <div className="feature"><span className="feature-icon"><Users size={21} /></span><div><h3>Norwich energy</h3><p>A city-centre chair and an online community of more than 13,000 followers.</p></div></div>
            </div>
            <a href={SITE.social.instagram} target="_blank" rel="noreferrer" className="button button-ghost">See real cuts on Instagram <Instagram size={17} /></a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="eyebrow">Simple by design</div><h2 className="section-title">Chair booked<br />in three steps.</h2>
          <div className="process-grid" style={{ marginTop: 50 }}>
            <div className="process-card"><span className="process-icon"><Scissors /></span><h3>Choose your service</h3><p>Pick the cut or grooming service that matches the finish you want.</p></div>
            <div className="process-card"><span className="process-icon"><Clock3 /></span><h3>Pick your time</h3><p>See clear availability and reserve the slot that fits your day.</p></div>
            <div className="process-card"><span className="process-icon"><Check /></span><h3>You&apos;re locked in</h3><p>Get an instant reference, then manage or reschedule online at any time.</p></div>
          </div>
        </div>
      </section>

      <a className="social-band" href={SITE.social.instagram} target="_blank" rel="noreferrer">
        <div className="social-track">
          <span>Fresh fades in Norwich</span><span>Follow @3d.cutz.norwich</span><span>Real cuts. Real detail.</span>
          <span>Fresh fades in Norwich</span><span>Follow @3d.cutz.norwich</span><span>Real cuts. Real detail.</span>
        </div>
      </a>

      <section className="section section-white">
        <div className="shell">
          <div className="section-head"><div><div className="eyebrow">The journal</div><h2 className="section-title">Sharper<br />knowledge.</h2></div><Link href="/blog" className="text-link">Read all articles <ArrowRight size={17} /></Link></div>
          <div className="journal-grid">
            {articles.map((article) => (
              <Link href={`/blog/${article.slug}`} className="journal-card" key={article.slug}>
                <div className="journal-image"><Image src={article.image} alt="" fill sizes="(max-width: 700px) 100vw, 33vw" /></div>
                <div className="journal-body"><div className="journal-meta"><span>{article.category}</span><span>·</span><time>{article.date}</time></div><h3>{article.title}</h3><p>{article.excerpt}</p></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="location">
        <div className="shell location-grid">
          <div>
            <div className="eyebrow">Find the chair</div><h2 className="section-title">Right in the heart of Norwich.</h2>
            <p className="section-copy">Easy to reach from the station and city centre. Tap below for live directions.</p>
            <div className="location-details">
              <div className="location-line"><span><MapPin size={19} /></span><div><strong>{SITE.address.street}</strong><small>{SITE.address.city}, {SITE.address.postcode}</small></div></div>
              <div className="location-line"><span><Navigation size={19} /></span><div><strong>Norwich city centre</strong><small>Close to Norwich railway station</small></div></div>
            </div>
            <a href={SITE.social.google} target="_blank" rel="noreferrer" className="button button-dark" style={{ marginTop: 30 }}>Get directions <ArrowUpRight size={17} /></a>
          </div>
          <div className="map-frame"><iframe title={`Map showing ${fullAddress}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`} /></div>
        </div>
      </section>

      <section className="section section-white">
        <div className="shell"><div style={{ textAlign: "center" }}><div className="eyebrow" style={{ justifyContent: "center" }}>Quick answers</div><h2 className="section-title">Before you book.</h2></div>
          <div className="faq-list">{faqs.map((faq) => <details className="faq-item" key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>)}</div>
        </div>
      </section>

      <section className="final-cta"><div className="shell cta-inner"><h2>Your next look starts here.</h2><Link href="/book" className="button button-dark button-wide">Book your chair <ArrowUpRight size={18} /></Link></div></section>
    </>
  );
}
