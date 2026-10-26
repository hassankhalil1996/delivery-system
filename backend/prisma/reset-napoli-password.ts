
import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

import { prisma } from "../src/lib/prisma.js";
import { hashPassword } from "../src/lib/password.js";

async function main() {
  const business = await prisma.business.findUnique({
    where: { username: "napoli" },
    select: {
      id: true,
      name: true,
      username: true,
    },
  });

  if (!business || business.id !== 2) {
    throw new Error("Pizza Napoli business not found");
  }

  console.log(`Resetting password for ${business.name}`);

  const rl = createInterface({
    input: stdin,
    output: stdout,
  });

  let newPassword: string;

  try {
    newPassword = await rl.question("Enter new password: ");
  } finally {
    rl.close();
  }

  if (newPassword.length < 12) {
    throw new Error("Password must contain at least 12 characters");
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction(async (tx) => {
    await tx.business.update({
      where: { id: business.id },
      data: { passwordHash },
    });

    // Invalidate previous Pizza Napoli login sessions
    await tx.session.deleteMany({
      where: { businessId: business.id },
    });
  });

  console.log("Pizza Napoli password reset successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
