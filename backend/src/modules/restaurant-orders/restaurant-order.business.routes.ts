
import { Router } from "express";
import { requireBusiness } from "../auth/auth.middleware.js";

import {
  getRestaurantOrdersController,
  acceptRestaurantOrderController,
  rejectRestaurantOrderController,
} from "./restaurant-order.business.controller.js";

const router = Router();

router.use(requireBusiness);

// List the logged-in restaurant's customer orders
router.get("/", getRestaurantOrdersController);

// Accept a pending customer order
router.patch("/:orderId/accept", acceptRestaurantOrderController);

// Reject a pending customer order
router.patch("/:orderId/reject", rejectRestaurantOrderController);

export default router;
