
import { Router } from "express";
import { postOrder, getAvailableOrdersController } from "./order.controller.js";
import { requireBusiness, requireCourier } from "../auth/auth.middleware.js";

const router = Router();


// Business creates a delivery order
router.post("/", requireBusiness, postOrder);


// Courier views pending, unassigned deliveries
router.get(
  "/available",
  requireCourier,
  getAvailableOrdersController
);

export default router;
