
import { Router } from "express";

import {
  getPricingController,
  updatePricingController,
} from "./pricing.controller.js";

import { requireAdmin } from "../auth/auth.middleware.js";
import { getCurrentUser } from "../auth/auth.service.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    await getPricingController(req, res);
  } catch (error) {
    next(error);
  }
});

router.put("/:area", requireAdmin, updatePricingController);

export default router;
