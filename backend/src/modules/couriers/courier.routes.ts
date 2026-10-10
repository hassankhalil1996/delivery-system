
import { Router } from "express";
import { postCourier } from "./courier.controller.js";
import { requireAdmin } from "../auth/auth.middleware.js";

const router = Router();

router.post("/", requireAdmin, postCourier);

export default router;
