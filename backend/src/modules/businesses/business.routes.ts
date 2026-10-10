import { Router } from "express";
import {
  getBusinesses,
  postBusiness,
} from "./business.controller.js";
import { requireAdmin } from "../auth/auth.middleware.js";

const router = Router();

router.get("/", getBusinesses);
router.post("/", requireAdmin, postBusiness);

export default router;