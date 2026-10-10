// src/modules/businesses/business.controller.ts

import type { Request, Response } from "express";
import { getAllBusinesses } from "./business.service.js";

export async function getBusinesses(req: Request, res: Response) {
  try {
    const businesses = await getAllBusinesses();
    res.json(businesses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
}