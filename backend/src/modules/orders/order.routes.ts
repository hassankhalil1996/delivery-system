
import { Router } from "express";
import { postOrder } from "./order.controller.js";
import { requireBusiness } from "../auth/auth.middleware.js";

const router = Router();

router.post("/", requireBusiness, postOrder);

export default router;
