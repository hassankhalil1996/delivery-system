import type { Request, Response } from "express";

import {
  createOrder,
  getAvailableOrders,
  PricingNotConfiguredError,
  acceptOrder,
  getCourierOrders,
  OrderNotAvailableError,
  pickupOrder,
  deliverOrder,
  InvalidOrderTransitionError,
  getBusinessOrders,
} from "./order.service.js";

import { getCurrentUser } from "../auth/auth.service.js";
import { isValidArea } from "../pricing/pricing.service.js";

export async function postOrder(req: Request, res: Response) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
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
      orderPrice >= 0 &&
      Number.isInteger(Number(orderPrice.toFixed(2)) * 100)

    if (
      typeof customerName !== "string" ||
      !customerName.trim() ||
      typeof customerPhone !== "string" ||
      !customerPhone.trim() ||
      !isValidArea(area) ||
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
      prepMinutes,
      notes: notes?.trim(),
    });

    res.status(201).json(order);
  } catch (error) {
    if (error instanceof PricingNotConfiguredError) {
      res.status(409).json({ error: error.message });
      return;
    }

    console.error("Failed to create order:", error);
    res.status(500).json({
      error: "Failed to create order",
    });
  }
}

export async function getAvailableOrdersController(
  _req: Request,
  res: Response
) {
  try {
    const orders = await getAvailableOrders();
    res.status(200).json(orders);
  } catch (error) {
    console.error("Failed to fetch available orders:", error);
    res.status(500).json({
      error: "Failed to fetch available orders",
    });
  }
}


export async function acceptOrderController(
  req: Request,
  res: Response
) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      res.status(401).json({
        error: "Not authenticated",
      });
      return;
    }

    if (user.role !== "COURIER") {
      res.status(403).json({
        error: "Courier access required",
      });
      return;
    }

    const rawOrderId = req.params.orderId;
    const orderId = Number(rawOrderId);

    if (
      !Number.isSafeInteger(orderId) ||
      orderId <= 0
    ) {
      res.status(400).json({
        error: "Invalid order ID",
      });
      return;
    }

    const order = await acceptOrder(orderId, user.id);

    res.status(200).json(order);
  } catch (error) {
    if (error instanceof OrderNotAvailableError) {
      res.status(409).json({
        error: error.message,
      });
      return;
    }

    console.error("Failed to accept order:", error);
    res.status(500).json({
      error: "Failed to accept delivery",
    });
  }
}

export async function getMyOrdersController(
  req: Request,
  res: Response
) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      res.status(401).json({
        error: "Not authenticated",
      });
      return;
    }

    if (user.role !== "COURIER") {
      res.status(403).json({
        error: "Courier access required",
      });
      return;
    }

    const orders = await getCourierOrders(user.id);

    res.status(200).json(orders);
  } catch (error) {
    console.error("Failed to fetch courier orders:", error);

    res.status(500).json({
      error: "Failed to fetch my deliveries",
    });
  }
}



export async function pickupOrderController(
  req: Request,
  res: Response
) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      res.status(401).json({
        error: "Not authenticated",
      });
      return;
    }

    if (user.role !== "COURIER") {
      res.status(403).json({
        error: "Courier access required",
      });
      return;
    }

    const orderId = Number(req.params.orderId);

    if (
      !Number.isSafeInteger(orderId) ||
      orderId <= 0
    ) {
      res.status(400).json({
        error: "Invalid order ID",
      });
      return;
    }

    const order = await pickupOrder(orderId, user.id);

    res.status(200).json(order);
  } catch (error) {
    if (error instanceof InvalidOrderTransitionError) {
      res.status(409).json({
        error: error.message,
      });
      return;
    }

    console.error("Failed to pick up order:", error);
    res.status(500).json({
      error: "Failed to confirm pickup",
    });
  }
}

export async function deliverOrderController(
  req: Request,
  res: Response
) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      res.status(401).json({
        error: "Not authenticated",
      });
      return;
    }

    if (user.role !== "COURIER") {
      res.status(403).json({
        error: "Courier access required",
      });
      return;
    }

    const orderId = Number(req.params.orderId);

    if (
      !Number.isSafeInteger(orderId) ||
      orderId <= 0
    ) {
      res.status(400).json({
        error: "Invalid order ID",
      });
      return;
    }

    const order = await deliverOrder(orderId, user.id);

    res.status(200).json(order);
  } catch (error) {
    if (error instanceof InvalidOrderTransitionError) {
      res.status(409).json({
        error: error.message,
      });
      return;
    }

    console.error("Failed to deliver order:", error);
    res.status(500).json({
      error: "Failed to mark order delivered",
    });
  }
}


export async function getBusinessOrdersController(
  req: Request,
  res: Response
) {
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

    const orders = await getBusinessOrders(user.id);

    res.status(200).json(orders);
  } catch (error) {
    console.error("Failed to fetch business orders:", error);

    res.status(500).json({
      error: "Failed to fetch business orders",
    });
  }
}
