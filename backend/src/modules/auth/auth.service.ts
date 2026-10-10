import { randomBytes, createHash } from "node:crypto";
import { prisma } from "../../lib/prisma.js";
import { verifyPassword } from "../../lib/password.js";
import type { Request } from "express";

const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000;

// Login for both ADMIN and BUSINESS
export async function loginAdmin(username: string, password: string) {
  const admin = await prisma.admin.findUnique({
    where: { username },
  });

  const business = await prisma.business.findUnique({
    where: { username },
  });

  let user:
    | { id: number; username: string; role: "ADMIN" }
    | { id: number; username: string; name: string; role: "BUSINESS" }
    | null = null;

  // Check admin credentials
  if (admin && await verifyPassword(admin.passwordHash, password)) {
    user = {
      id: admin.id,
      username: admin.username,
      role: "ADMIN",
    };
  }

  // Check business credentials if admin login didn't succeed
  if (
    !user &&
    business &&
    business.isActive &&
    business.passwordHash &&
    business.username &&
    await verifyPassword(business.passwordHash, password)
  ) {
    user = {
      id: business.id,
      username: business.username,
      name: business.name,
      role: "BUSINESS",
    };
  }

  if (!user) return null;

  // Create secure session
  const token = randomBytes(32).toString("hex");

  const tokenHash = createHash("sha256")
    .update(token)
    .digest("hex");

  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await prisma.session.create({
    data: {
      id: tokenHash,
      adminId: user.role === "ADMIN" ? user.id : null,
      businessId: user.role === "BUSINESS" ? user.id : null,
      expiresAt,
    },
  });

  return {
    token,
    expiresAt,
    admin: user, // Keep this property for compatibility with existing controller
  };
}

// Identify currently logged-in user
export async function getCurrentUser(req: Request) {
  const token = req.cookies?.session;

  if (typeof token !== "string") {
    return null;
  }

  const tokenHash = createHash("sha256")
    .update(token)
    .digest("hex");

  const session = await prisma.session.findUnique({
    where: { id: tokenHash },
    include: {
      admin: true,
      business: true,
    },
  });

  if (!session || session.expiresAt <= new Date()) {
    return null;
  }

  if (session.admin && !session.business) {
    return {
      id: session.admin.id,
      username: session.admin.username,
      role: "ADMIN" as const,
    };
  }

  if (
    session.business &&
    !session.admin &&
    session.business.isActive &&
    session.business.username
  ) {
    return {
      id: session.business.id,
      username: session.business.username,
      name: session.business.name,
      role: "BUSINESS" as const,
    };
  }

  return null;
}

// Logout for both ADMIN and BUSINESS
export async function logout(req: Request): Promise<void> {
  const token = req.cookies?.session;

  if (typeof token !== "string") return;

  const sessionId = createHash("sha256")
    .update(token)
    .digest("hex");

  await prisma.session.deleteMany({
    where: { id: sessionId },
  });
}