import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { prisma } from "../src/lib/prisma.js";
import { hashPassword } from "../src/lib/password.js";

const rl = createInterface({
  input: stdin,
  output: stdout,
});

async function main() {
  const username = (await rl.question("Admin username: ")).trim();

  if (!username) {
    throw new Error("Username cannot be empty");
  }

  // Read the password from an environment variable
  // to avoid exposing it in the terminal input.
  const password = process.env.ADMIN_SETUP_PASSWORD;

  if (!password || password.length < 12) {
    throw new Error("Set ADMIN_SETUP_PASSWORD to at least 12 characters");
  }

  const existingAdmin = await prisma.admin.findFirst();

  if (existingAdmin) {
    throw new Error("An admin account already exists");
  }

  const passwordHash = await hashPassword(password);

  await prisma.admin.create({
    data: {
      username,
      passwordHash,
    },
  });

  console.log("Admin account created successfully");
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  rl.close();
  await prisma.$disconnect();
}