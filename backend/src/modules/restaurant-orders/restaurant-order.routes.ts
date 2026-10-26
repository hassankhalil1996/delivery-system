
import { Router } from "express";
import {
  postRestaurantOrder,
  trackRestaurantOrderController
} from "./restaurant-order.controller.js";



const router = Router();

// Public customer checkout: no login required
router.post("/", postRestaurantOrder);

router.get("/track/:token", trackRestaurantOrderController);

export default router;
