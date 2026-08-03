import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_COOKIE } from "@/lib/admin-auth";
import { createToken, hashToken } from "@/lib/booking-server";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(200),
});

function secureMatch(value: string, expected: string) {
  const valueHash = createHash("sha256").update(value).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(valueHash, expectedHash);
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "";
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  const valid = parsed.success && Boolean(adminEmail) && Boolean(adminPassword)
    && secureMatch(parsed.data.email, adminEmail)
    && secureMatch(parsed.data.password, adminPassword);

  if (!valid) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const sessionToken = createToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60_000);
  await prisma.$transaction([
    prisma.adminSession.deleteMany({ where: { expiresAt: { lte: new Date() } } }),
    prisma.adminSession.create({ data: { email: adminEmail, tokenHash: hashToken(sessionToken), expiresAt } }),
  ]);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  return response;
}
