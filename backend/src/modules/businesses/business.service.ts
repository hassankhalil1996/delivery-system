// src/modules/businesses/business.service.ts

import { prisma } from "../../lib/prisma.js";

export async function getAllBusinesses() {
  return prisma.business.findMany();
}

export async function createBusiness(name: string) {
  return prisma.business.create({
    data: { name },
  });
}