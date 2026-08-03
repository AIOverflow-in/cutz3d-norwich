import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { hashToken } from "./booking-server";

export const ADMIN_COOKIE = "cutz3d_admin_session";

export async function getAdminSession() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return prisma.adminSession.findFirst({ where: { tokenHash: hashToken(token), expiresAt: { gt: new Date() } } });
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}
