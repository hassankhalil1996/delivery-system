import { randomBytes, createHash } from "node:crypto";
import { prisma } from "../../lib/prisma.js";
import { verifyPassword } from "../../lib/password.js";

const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000;

export async function loginAdmin(username: string, password: string) {
  const admin = await prisma.admin.findUnique({
    where: { username },
  });

  if (!admin) return null;

  const validPassword = await verifyPassword(
    admin.passwordHash,
    password
  );

  if (!validPassword) return null;

  const token = randomBytes(32).toString("hex");

  const tokenHash = createHash("sha256")
    .update(token)
    .digest("hex");

  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await prisma.session.create({
    data: {
      id: tokenHash,
      adminId: admin.id,
      expiresAt,
    },
  });

  return {
    token,
    expiresAt,
    admin: {
      id: admin.id,
      username: admin.username,
      role: "ADMIN" as const,
    },
  };
}