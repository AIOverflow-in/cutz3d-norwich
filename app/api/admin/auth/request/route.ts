import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createToken, hashToken } from "@/lib/booking-server";
import { sendAdminLoginEmail } from "@/lib/email";

const schema = z.object({ email: z.string().trim().toLowerCase().email() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const generic = { message: "If that address is authorised, a secure sign-in link is on its way." };
  if (!parsed.success || !adminEmail || parsed.data.email !== adminEmail) return NextResponse.json(generic);

  const token = createToken();
  await prisma.adminLoginToken.create({
    data: { email: adminEmail, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 15 * 60_000) },
  });
  const loginUrl = new URL(`/api/admin/auth/verify?token=${encodeURIComponent(token)}`, request.url).toString();
  try {
    await sendAdminLoginEmail(adminEmail, loginUrl);
  } catch (error) {
    console.error("Admin login email failed", error);
    return NextResponse.json({ error: "The sign-in email could not be sent. Please try again." }, { status: 503 });
  }

  return NextResponse.json(process.env.NODE_ENV === "development" ? { ...generic, developmentLoginUrl: loginUrl } : generic);
}
