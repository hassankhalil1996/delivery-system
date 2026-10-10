
import type { Request, Response } from "express";
import { createOrder } from "./order.service.js";
import { getCurrentUser } from "../auth/auth.service.js";

const ALLOWED_AREAS = ["BUEINA", "NUJEIDAT"];

export async function postOrder(req: Request, res: Response) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      res.status(401).json({
        error: "Not authenticated",
      });
      return;
    }

    if (user.role !== "BUSINESS") {
      res.status(403).json({
        error: "Business access required",
      });
      return;
    }

    const {
      customerName,
      customerPhone,
      area,
      address,
      orderPrice,
      prepMinutes,
      notes,
    } = req.body ?? {};

    const validPrepTime =
      Number.isInteger(prepMinutes) &&
      prepMinutes >= 5 &&
      prepMinutes <= 60 &&
      prepMinutes % 5 === 0;

    const validOrderPrice =
      typeof orderPrice === "number" &&
      Number.isFinite(orderPrice) &&
      orderPrice >= 0;

    if (
      typeof customerName !== "string" ||
      !customerName.trim() ||
      typeof customerPhone !== "string" ||
      !customerPhone.trim() ||
      typeof area !== "string" ||
      !ALLOWED_AREAS.includes(area) ||
      typeof address !== "string" ||
      !address.trim() ||
      !validOrderPrice ||
      !validPrepTime ||
      (notes !== undefined && typeof notes !== "string")
    ) {
      res.status(400).json({
        error: "Invalid order data",
      });
      return;
    }

    const order = await createOrder({
      businessId: user.id,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      area,
      address: address.trim(),
      orderPrice,
      deliveryFee: 0,
      prepMinutes,
      notes: notes?.trim(),
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create order",
    });
  }
}
