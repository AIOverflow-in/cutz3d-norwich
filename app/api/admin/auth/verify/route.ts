import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE } from "@/lib/admin-auth";
import { createToken, hashToken } from "@/lib/booking-server";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  const login = token ? await prisma.adminLoginToken.findUnique({ where: { tokenHash: hashToken(token) } }) : null;
  if (!login || login.usedAt || login.expiresAt <= new Date()) {
    return NextResponse.redirect(new URL("/dashboard/login?error=invalid", request.url));
  }

  const sessionToken = createToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60_000);
  await prisma.$transaction([
    prisma.adminLoginToken.update({ where: { id: login.id }, data: { usedAt: new Date() } }),
    prisma.adminSession.create({ data: { email: login.email, tokenHash: hashToken(sessionToken), expiresAt } }),
  ]);

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set(ADMIN_COOKIE, sessionToken, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: expiresAt,
  });
  return response;
}
