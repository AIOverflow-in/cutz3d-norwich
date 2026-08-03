import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Clock3 } from "lucide-react";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { getAllPosts, getPost } from "@/lib/blog";
import { SITE } from "@/lib/site";

export function generateStaticParams() { return getAllPosts().map((post) => ({ slug: post.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return { title: post.title, description: post.description, keywords: post.keywords, alternates: { canonical: `/blog/${post.slug}` }, openGraph: { type: "article", title: post.title, description: post.description, publishedTime: post.publishedAt, images: [post.image] } };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug); if (!post) notFound();
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.description, datePublished: post.publishedAt, dateModified: post.publishedAt, image: `${SITE.url}${post.image}`, author: { "@type": "Organization", name: SITE.name }, publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: `${SITE.url}/images/cutz3d-logo.webp` } }, mainEntityOfPage: `${SITE.url}/blog/${post.slug}` };
  return <><JsonLd data={schema} /><article><header className="article-header"><div className="shell article-head-inner"><Link href="/blog" className="back-link"><ArrowLeft size={16} /> All articles</Link><div className="journal-meta"><span>{post.category}</span><span>·</span><time dateTime={post.publishedAt}>{new Date(`${post.publishedAt}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</time><span>·</span><span><Clock3 size={12} /> {post.readTime}</span></div><h1>{post.title}</h1><p>{post.description}</p></div></header><div className="shell article-image"><Image src={post.image} alt="" fill priority sizes="100vw" /></div><div className="article-layout shell"><div className="article-content">{post.content.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}</div><aside className="article-cta"><span>Ready for a sharper look?</span><strong>Book your chair in under a minute.</strong><Link href="/book" className="button button-primary">Book now <ArrowUpRight size={17} /></Link></aside></div></article></>;
}
