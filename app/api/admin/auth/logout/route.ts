import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE } from "@/lib/admin-auth";
import { hashToken } from "@/lib/booking-server";

export async function POST(request: Request) {
  const token = request.headers.get("cookie")?.match(new RegExp(`(?:^|; )${ADMIN_COOKIE}=([^;]+)`))?.[1];
  if (token) await prisma.adminSession.deleteMany({ where: { tokenHash: hashToken(decodeURIComponent(token)) } });
  const response = NextResponse.redirect(new URL("/dashboard/login", request.url), 303);
  response.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
  return response;
}
