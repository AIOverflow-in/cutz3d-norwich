import fs from "node:fs";
import path from "node:path";

export type BlogSection = { heading: string; paragraphs: string[] };
export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  readTime: string;
  image: string;
  keywords: string[];
  content: BlogSection[];
};

const postsDirectory = path.join(process.cwd(), "content", "blog");

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs.readdirSync(postsDirectory).filter((file) => file.endsWith(".json")).map((file) => JSON.parse(fs.readFileSync(path.join(postsDirectory, file), "utf8")) as BlogPost).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getPost(slug: string) {
  return getAllPosts().find((post) => post.slug === slug);
}
