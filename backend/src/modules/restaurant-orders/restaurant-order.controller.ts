
import type { Request, Response } from "express";
import {
  createRestaurantOrder,
  InvalidRestaurantOrderError,
} from "./restaurant-order.service.js";
import { isValidArea } from "../pricing/pricing.service.js";

import { getRestaurantOrderTracking } from "./restaurant-order.service.js";

export async function postRestaurantOrder(
  req: Request,
  res: Response
) {
  try {
    const {
      businessId,
      customerName,
      customerPhone,
      area,
      address,
      notes,
      items,
    } = req.body ?? {};

    if (
      !Number.isSafeInteger(businessId) ||
      businessId <= 0 ||
      typeof customerName !== "string" ||
      !customerName.trim() ||
      customerName.length > 100 ||
      typeof customerPhone !== "string" ||
      !customerPhone.trim() ||
      customerPhone.length > 30 ||
      !isValidArea(area) ||
      typeof address !== "string" ||
      !address.trim() ||
      address.length > 300 ||
      (notes !== undefined &&
        (typeof notes !== "string" || notes.length > 1000)) ||
      !Array.isArray(items)
    ) {
      res.status(400).json({ error: "Invalid order data" });
      return;
    }

    const order = await createRestaurantOrder({
      businessId,
      customerName,
      customerPhone,
      area,
      address,
      notes,
      items,
    });

    res.status(201).json(order);
  } catch (error) {
    if (error instanceof InvalidRestaurantOrderError) {
      res.status(400).json({ error: error.message });
      return;
    }

    console.error("Failed to create restaurant order:", error);
    res.status(500).json({
      error: "Failed to create restaurant order",
    });
  }
}


export async function trackRestaurantOrderController(
  req: Request,
  res: Response
) {
  try {
    const token = req.params.token;

    if (typeof token !== "string") {
      res.status(400).json({ error: "Invalid tracking token" });
      return;
    }

    const order = await getRestaurantOrderTracking(token);

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Failed to track restaurant order:", error);
    res.status(500).json({ error: "Failed to track order" });
  }
}