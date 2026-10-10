
import { prisma } from "../../lib/prisma.js";
import { hashPassword } from "../../lib/password.js";

export async function createCourier(
  name: string,
  username: string,
  password: string
) {
  const passwordHash = await hashPassword(password);

  return prisma.courier.create({
    data: {
      name,
      username,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      username: true,
      isActive: true,
      createdAt: true,
    },
  });
}
