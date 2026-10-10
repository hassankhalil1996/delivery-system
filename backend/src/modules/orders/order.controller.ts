import type { Request, Response } from "express";
import { createOrder } from "./order.service.js";

export async function postOrder(req: Request, res: Response) {
  try {
    const {
      businessId,
      customerName,
      customerPhone,
      area,
      address,
      orderPrice,
      deliveryFee,
      prepMinutes,
      notes,
    } = req.body;

    if (
      !Number.isInteger(businessId) ||
      businessId <= 0 ||
      typeof customerName !== "string" ||
      !customerName.trim() ||
      typeof customerPhone !== "string" ||
      !customerPhone.trim() ||
      typeof area !== "string" ||
      !area.trim() ||
      typeof address !== "string" ||
      !address.trim() ||
      typeof orderPrice !== "number" ||
      !Number.isFinite(orderPrice) ||
      orderPrice < 0 ||
      typeof deliveryFee !== "number" ||
      !Number.isFinite(deliveryFee) ||
      deliveryFee < 0 ||
      !Number.isInteger(prepMinutes) ||
      prepMinutes < 0 ||
      (notes !== undefined && typeof notes !== "string")
    ) {
      res.status(400).json({
        error: "Invalid order data",
      });
      return;
    }

    const order = await createOrder({
      businessId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      area: area.trim(),
      address: address.trim(),
      orderPrice,
      deliveryFee,
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