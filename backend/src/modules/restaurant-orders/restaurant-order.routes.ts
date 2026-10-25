
import { Router } from "express";
import {
  postRestaurantOrder,
} from "./restaurant-order.controller.js";

const router = Router();

// Public customer checkout: no login required
router.post("/", postRestaurantOrder);

export default router;
