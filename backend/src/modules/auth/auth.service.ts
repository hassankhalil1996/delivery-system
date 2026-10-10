
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "../../lib/prisma.js";
import { verifyPassword } from "../../lib/password.js";
import type { Request } from "express";

const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000;

type AuthUser =
  | {
      id: number;
      username: string;
      role: "ADMIN";
    }
  | {
      id: number;
      username: string;
      name: string;
      role: "BUSINESS";
    }
  | {
      id: number;
      username: string;
      name: string;
      role: "COURIER";
    };

// Login for ADMIN, BUSINESS and COURIER
export async function loginAdmin(
  username: string,
  password: string
) {
  const [admin, business, courier] = await Promise.all([
    prisma.admin.findUnique({ where: { username } }),
    prisma.business.findUnique({ where: { username } }),
    prisma.courier.findUnique({ where: { username } }),
  ]);

  let user: AuthUser | null = null;

  // Admin login
  if (
    admin &&
    (await verifyPassword(admin.passwordHash, password))
  ) {
    user = {
      id: admin.id,
      username: admin.username,
      role: "ADMIN",
    };
  }

  // Business login
  if (
    !user &&
    business &&
    business.isActive &&
    business.username &&
    business.passwordHash &&
    (await verifyPassword(business.passwordHash, password))
  ) {
    user = {
      id: business.id,
      username: business.username,
      name: business.name,
      role: "BUSINESS",
    };
  }

  // Courier login
  if (
    !user &&
    courier &&
    courier.isActive &&
    (await verifyPassword(courier.passwordHash, password))
  ) {
    user = {
      id: courier.id,
      username: courier.username,
      name: courier.name,
      role: "COURIER",
    };
  }

  if (!user) return null;

  // Create secure session token
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
      courierId: user.role === "COURIER" ? user.id : null,
      expiresAt,
    },
  });

  return {
    token,
    expiresAt,
    admin: user, // Preserves compatibility with existing controller
  };
}

// Identify the logged-in user
export async function getCurrentUser(
  req: Request
): Promise<AuthUser | null> {
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
      courier: true,
    },
  });

  if (!session || session.expiresAt <= new Date()) {
    return null;
  }

  // Admin session
  if (
    session.admin &&
    !session.business &&
    !session.courier
  ) {
    return {
      id: session.admin.id,
      username: session.admin.username,
      role: "ADMIN",
    };
  }

  // Business session
  if (
    session.business &&
    !session.admin &&
    !session.courier &&
    session.business.isActive &&
    session.business.username
  ) {
    return {
      id: session.business.id,
      username: session.business.username,
      name: session.business.name,
      role: "BUSINESS",
    };
  }

  // Courier session
  if (
    session.courier &&
    !session.admin &&
    !session.business &&
    session.courier.isActive
  ) {
    return {
      id: session.courier.id,
      username: session.courier.username,
      name: session.courier.name,
      role: "COURIER",
    };
  }

  return null;
}

// Logout for all three roles
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
