// src/modules/businesses/business.service.ts

import { prisma } from "../../lib/prisma.js";
import { hashPassword } from "../../lib/password.js";


export async function getAllBusinesses() {
  return prisma.business.findMany();
}

export async function createBusiness(
  name: string,
  username: string,
  password: string
) {
  const passwordHash = await hashPassword(password);

  return prisma.business.create({
    data: {
      name,
      username,
      passwordHash,
      isActive: true,
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

export async function createBusinessAccount(data: {
  name: string;
  username: string;
  password: string;
}) {
  const passwordHash = await hashPassword(data.password);

  return prisma.business.create({
    data: {
      name: data.name,
      username: data.username,
      passwordHash,
      isActive: true,
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