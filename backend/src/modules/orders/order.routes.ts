import { Router } from "express";

import {
  postOrder,
  getAvailableOrdersController,
  acceptOrderController,
  getMyOrdersController,
} from "./order.controller.js";

import {
  requireBusiness,
  requireCourier,
} from "../auth/auth.middleware.js";

const router = Router();

// Business creates a delivery order
router.post("/", requireBusiness, postOrder);

// Courier views pending, unassigned deliveries
router.get(
  "/available",
  requireCourier,
  getAvailableOrdersController
);

// Courier views their assigned deliveries
router.get(
  "/mine",
  requireCourier,
  getMyOrdersController
);

// Courier accepts an available delivery
router.patch(
  "/:orderId/accept",
  requireCourier,
  acceptOrderController
);

export default router;
