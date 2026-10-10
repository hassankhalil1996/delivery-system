// src/modules/businesses/business.service.ts

import { prisma } from "../../lib/prisma.js";

export async function getAllBusinesses() {
  return prisma.business.findMany();
}