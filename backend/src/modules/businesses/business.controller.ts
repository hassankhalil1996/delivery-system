// src/modules/businesses/business.controller.ts

import type { Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import { getAllBusinesses,createBusiness,createBusinessAccount  } from "./business.service.js";

export async function getBusinesses(req: Request, res: Response) {
  try {
    const businesses = await getAllBusinesses();
    res.json(businesses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
}

export async function postBusiness(req: Request, res: Response) {
  try {
    const { name, username, password } = req.body ?? {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof username !== "string" ||
      !username.trim() ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      res.status(400).json({
        error: "Name, username, and password (minimum 8 characters) are required",
      });
      return;
    }

    const business = await createBusiness(
      name.trim(),
      username.trim(),
      password
    );

    res.status(201).json(business);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(409).json({ error: "Username already exists" });
      return;
    }

    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
}