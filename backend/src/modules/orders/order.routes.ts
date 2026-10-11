
import { Router } from "express";

import {
  postOrder,
  getAvailableOrdersController,
  acceptOrderController,
  getMyOrdersController,
  pickupOrderController,
  deliverOrderController,
  getBusinessOrdersController,
} from "./order.controller.js";

import {
  requireBusiness,
  requireCourier,
} from "../auth/auth.middleware.js";

const router = Router();

// Business creates an order
router.post("/", requireBusiness, postOrder);

// Courier sees available orders
router.get(
  "/available",
  requireCourier,
  getAvailableOrdersController
);

// Courier sees their orders
router.get(
  "/mine",
  requireCourier,
  getMyOrdersController
);

// PENDING -> ASSIGNED
router.patch(
  "/:orderId/accept",
  requireCourier,
  acceptOrderController
);

// ASSIGNED -> PICKED_UP
router.patch(
  "/:orderId/pickup",
  requireCourier,
  pickupOrderController
);

// PICKED_UP -> DELIVERED
router.patch(
  "/:orderId/deliver",
  requireCourier,
  deliverOrderController
);


// Business views only its own orders
router.get(
  "/business/mine",
  requireBusiness,
  getBusinessOrdersController
);
export default router;
