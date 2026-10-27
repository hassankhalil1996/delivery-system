
import { Router } from "express";
import { requireBusiness } from "../auth/auth.middleware.js";

import {
  getRestaurantOrdersController,
  acceptRestaurantOrderController,
  startPreparingRestaurantOrderController,
  markRestaurantOrderReadyController,
  rejectRestaurantOrderController,
} from "./restaurant-order.business.controller.js"

const router = Router();

// All routes require an authenticated business account.
router.use(requireBusiness);

// List the logged-in restaurant's customer orders.
router.get("/", getRestaurantOrdersController);

// PENDING -> ACCEPTED
router.patch(
  "/:orderId/accept",
  acceptRestaurantOrderController
);

// ACCEPTED -> PREPARING
router.patch(
  "/:orderId/preparing",
  startPreparingRestaurantOrderController
);

// ACCEPTED or PREPARING -> READY
router.patch(
  "/:orderId/ready",
  markRestaurantOrderReadyController
);

// PENDING -> REJECTED
router.patch(
  "/:orderId/reject",
  rejectRestaurantOrderController
);

export default router;
