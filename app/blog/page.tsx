import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = { title: "Barber tips & grooming journal", description: "Useful skin fade, haircut and beard grooming advice from 3D Cutz Norwich.", alternates: { canonical: "/blog" } };

export default function BlogPage() {
  const posts = getAllPosts();
  return <><section className="page-hero blog-hero"><div className="shell"><div className="page-badge"><Sparkles size={14} /> Fresh advice, published regularly</div><h1 className="section-title">The sharp<br />side of Norwich.</h1><p className="section-copy">No fluff. Just useful guidance on fades, cuts, beard care and keeping your look in shape.</p></div></section><section className="section"><div className="shell"><div className="blog-grid">{posts.map((post, index) => <article className={`blog-card ${index === 0 ? "featured" : ""}`} key={post.slug}><Link href={`/blog/${post.slug}`} className="blog-card-image"><Image src={post.image} alt="" fill priority={index === 0} sizes={index === 0 ? "(max-width: 800px) 100vw, 60vw" : "(max-width: 800px) 100vw, 40vw"} /></Link><div className="blog-card-body"><div className="journal-meta"><span>{post.category}</span><span>·</span><time dateTime={post.publishedAt}>{new Date(`${post.publishedAt}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</time><span>·</span><span>{post.readTime}</span></div><h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2><p>{post.description}</p><Link className="text-link" href={`/blog/${post.slug}`}>Read article <ArrowRight size={16} /></Link></div></article>)}</div></div></section></>;
}
