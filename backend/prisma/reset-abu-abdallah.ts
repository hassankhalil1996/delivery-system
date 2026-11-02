
import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import { hashPassword } from "../src/lib/password.js";

async function main() {
  const businessId = 9;
  const username = "abd1234";

  const password = process.env.ABU_ABDALLAH_NEW_PASSWORD;

  if (!password || password.length < 12) {
    throw new Error(
      "Set ABU_ABDALLAH_NEW_PASSWORD to a password of at least 12 characters."
    );
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true, name: true },
  });

  if (!business) {
    throw new Error("Business ID 9 not found");
  }

  const usernameTaken = await prisma.business.findUnique({
    where: { username },
    select: { id: true },
  });

  if (usernameTaken && usernameTaken.id !== businessId) {
    throw new Error("Username abd1234 is already taken");
  }

  await prisma.business.update({
    where: { id: businessId },
    data: {
      username,
      passwordHash: await hashPassword(password),
      isActive: true,
    },
  });

  console.log("Business login updated successfully");
  console.log("Business ID:", business.id);
  console.log("Business name:", business.name);
  console.log("Username:", username);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
