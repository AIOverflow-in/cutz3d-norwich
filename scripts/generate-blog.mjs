import fs from "node:fs/promises";
import path from "node:path";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error("OPENAI_API_KEY is required to generate a blog post.");

const directory = path.join(process.cwd(), "content", "blog");
const existingFiles = (await fs.readdir(directory)).filter((file) => file.endsWith(".json"));
const existing = await Promise.all(existingFiles.map(async (file) => JSON.parse(await fs.readFile(path.join(directory, file), "utf8"))));
const topics = [
  "How to make a haircut last longer between barber visits",
  "Low fade, mid fade or high fade: choosing the right height",
  "A simple men's hair styling routine for busy mornings",
  "How often should you book a beard trim?",
  "What to expect at your first barber appointment in Norwich",
  "Haircut ideas for students in Norwich",
];
const usedTitles = existing.map((post) => post.title);
const topic = topics.find((candidate) => !usedTitles.some((title) => title.toLowerCase().includes(candidate.split(":")[0].toLowerCase()))) || `${topics[existing.length % topics.length]} — updated guide`;
const today = new Date().toISOString().slice(0, 10);
const prompt = `Write one genuinely useful local SEO article for 3D Cutz, a barber at 19 Prince of Wales Road, Norwich NR1 1BD. Topic: ${topic}. Do not invent reviews, staff, awards, phone numbers, opening hours or guarantees. Use natural British English and avoid keyword stuffing. Return JSON only with: slug, title, description (max 155 chars), category, publishedAt (set to ${today}), readTime, image (choose /images/skin-fade.webp, /images/craft.webp or /images/tools.webp), keywords (3 strings), and content (4 sections, each with heading and 1-2 paragraph strings). Existing titles to avoid: ${usedTitles.join(" | ")}.`;

const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: process.env.BLOG_MODEL || "gpt-5-mini", input: prompt }) });
if (!response.ok) throw new Error(`Blog generation failed: ${response.status} ${await response.text()}`);
const payload = await response.json();
const text = payload.output?.flatMap((item) => item.content || []).find((item) => item.type === "output_text")?.text;
if (!text) throw new Error("The model returned no article text.");
const post = JSON.parse(text.replace(/^```json\s*|\s*```$/g, ""));
if (!post.slug || !post.title || !Array.isArray(post.content) || post.content.length < 3) throw new Error("Generated article did not match the required structure.");
post.publishedAt = today;
await fs.writeFile(path.join(directory, `${post.slug}.json`), `${JSON.stringify(post, null, 2)}\n`);
console.log(`Generated content/blog/${post.slug}.json`);
