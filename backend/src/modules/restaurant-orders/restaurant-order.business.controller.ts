
import type { Request, Response } from "express";

import { getCurrentUser } from "../auth/auth.service.js";

import {
  getRestaurantOrders,
  acceptRestaurantOrder,
  rejectRestaurantOrder,
  startPreparingRestaurantOrder,
  markRestaurantOrderReady,
  InvalidRestaurantOrderError,
} from "./restaurant-order.service.js";

async function getAuthenticatedBusinessId(
  req: Request
): Promise<number | null> {
  const user = await getCurrentUser(req);

  if (!user || user.role !== "BUSINESS") {
    return null;
  }

  return user.id;
}

function parseOrderId(req: Request): number | null {
  const raw = req.params.orderId;

  if (typeof raw !== "string" || !/^[1-9]\d*$/.test(raw)) {
    return null;
  }

  const id = Number(raw);

  return Number.isSafeInteger(id) ? id : null;
}

export async function getRestaurantOrdersController(
  req: Request,
  res: Response
) {
  try {
    const businessId = await getAuthenticatedBusinessId(req);

    if (businessId === null) {
      res.status(403).json({
        error: "Business access required",
      });
      return;
    }

    const orders = await getRestaurantOrders(businessId);

    res.status(200).json(orders);
  } catch (error) {
    console.error(
      "Failed to fetch restaurant orders:",
      error
    );

    res.status(500).json({
      error: "Failed to fetch restaurant orders",
    });
  }
}

export async function acceptRestaurantOrderController(
  req: Request,
  res: Response
) {
  try {
    const businessId = await getAuthenticatedBusinessId(req);

    if (businessId === null) {
      res.status(403).json({
        error: "Business access required",
      });
      return;
    }

    const orderId = parseOrderId(req);
    const prepMinutes = req.body?.prepMinutes;

    if (
      orderId === null ||
      !Number.isSafeInteger(prepMinutes) ||
      prepMinutes < 1 ||
      prepMinutes > 180
    ) {
      res.status(400).json({
        error: "Invalid order ID or preparation time",
      });
      return;
    }

    const order = await acceptRestaurantOrder(
      orderId,
      businessId,
      prepMinutes
    );

    res.status(200).json(order);
  } catch (error) {
    if (error instanceof InvalidRestaurantOrderError) {
      res.status(409).json({
        error: error.message,
      });
      return;
    }

    console.error(
      "Failed to accept restaurant order:",
      error
    );

    res.status(500).json({
      error: "Failed to accept restaurant order",
    });
  }
}

export async function startPreparingRestaurantOrderController(
  req: Request,
  res: Response
) {
  try {
    const businessId = await getAuthenticatedBusinessId(req);

    if (businessId === null) {
      res.status(403).json({
        error: "Business access required",
      });
      return;
    }

    const orderId = parseOrderId(req);

    if (orderId === null) {
      res.status(400).json({
        error: "Invalid order ID",
      });
      return;
    }

    const order = await startPreparingRestaurantOrder(
      orderId,
      businessId
    );

    res.status(200).json(order);
  } catch (error) {
    if (error instanceof InvalidRestaurantOrderError) {
      res.status(409).json({
        error: error.message,
      });
      return;
    }

    console.error(
      "Failed to start preparing restaurant order:",
      error
    );

    res.status(500).json({
      error: "Failed to start preparing restaurant order",
    });
  }
}

export async function markRestaurantOrderReadyController(
  req: Request,
  res: Response
) {
  try {
    const businessId = await getAuthenticatedBusinessId(req);

    if (businessId === null) {
      res.status(403).json({
        error: "Business access required",
      });
      return;
    }

    const orderId = parseOrderId(req);

    if (orderId === null) {
      res.status(400).json({
        error: "Invalid order ID",
      });
      return;
    }

    const order = await markRestaurantOrderReady(
      orderId,
      businessId
    );

    res.status(200).json(order);
  } catch (error) {
    if (error instanceof InvalidRestaurantOrderError) {
      res.status(409).json({
        error: error.message,
      });
      return;
    }

    console.error(
      "Failed to mark restaurant order ready:",
      error
    );

    res.status(500).json({
      error: "Failed to mark restaurant order ready",
    });
  }
}

export async function rejectRestaurantOrderController(
  req: Request,
  res: Response
) {
  try {
    const businessId = await getAuthenticatedBusinessId(req);

    if (businessId === null) {
      res.status(403).json({
        error: "Business access required",
      });
      return;
    }

    const orderId = parseOrderId(req);

    if (orderId === null) {
      res.status(400).json({
        error: "Invalid order ID",
      });
      return;
    }

    const order = await rejectRestaurantOrder(
      orderId,
      businessId
    );

    res.status(200).json(order);
  } catch (error) {
    if (error instanceof InvalidRestaurantOrderError) {
      res.status(409).json({
        error: error.message,
      });
      return;
    }

    console.error(
      "Failed to reject restaurant order:",
      error
    );

    res.status(500).json({
      error: "Failed to reject restaurant order",
    });
  }
}
