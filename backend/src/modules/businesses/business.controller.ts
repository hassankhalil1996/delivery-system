// src/modules/businesses/business.controller.ts

import type { Request, Response } from "express";
import { getAllBusinesses,createBusiness } from "./business.service.js";

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
    const { name } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({
        error: "Business name is required",
      });
      return;
    }

    const business = await createBusiness(name.trim());

    res.status(201).json(business);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
}