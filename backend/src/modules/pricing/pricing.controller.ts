
import type { Request, Response } from "express";

import {
  getAllPricing,
  updatePricing,
  isValidArea,
  isValidReason,
} from "./pricing.service.js";

export async function getPricingController(
  _req: Request,
  res: Response
) {
  try {
    const pricing = await getAllPricing();
    res.json(pricing);
  } catch (error) {
    console.error("Failed to fetch pricing:", error);
    res.status(500).json({
      error: "Failed to fetch pricing",
    });
  }
}

export async function updatePricingController(
  req: Request,
  res: Response
) {
  try {
    const area = req.params.area;
    const { fee, reason, reasonDetails } = req.body ?? {};

    if (!isValidArea(area)) {
      res.status(400).json({ error: "Invalid delivery area" });
      return;
    }

    if (
      typeof fee !== "number" ||
      !Number.isFinite(fee) ||
      fee < 0 ||
      !Number.isInteger(fee * 100) ||
      fee > 99999999
    ) {
      res.status(400).json({
        error: "Fee must be a valid non-negative amount",
      });
      return;
    }

    if (!isValidReason(reason)) {
      res.status(400).json({
        error: "Invalid pricing reason",
      });
      return;
    }

    if (
      reasonDetails !== undefined &&
      reasonDetails !== null &&
      typeof reasonDetails !== "string"
    ) {
      res.status(400).json({
        error: "Invalid reason details",
      });
      return;
    }

    const details =
      reason === "OTHER"
        ? reasonDetails?.trim() || null
        : null;

    if (reason === "OTHER" && !details) {
      res.status(400).json({
        error: "Please explain the pricing reason",
      });
      return;
    }

    if (details && details.length > 250) {
      res.status(400).json({
        error: "Reason details must be 250 characters or fewer",
      });
      return;
    }

    const pricing = await updatePricing(
      area,
      fee,
      reason,
      details
    );

    res.json(pricing);
  } catch (error) {
    console.error("Failed to update pricing:", error);
    res.status(500).json({
      error: "Failed to update pricing",
    });
  }
}
