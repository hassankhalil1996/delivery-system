import { Router } from "express";
import { postOrder } from "./order.controller.js";

import { requireAdmin } from "../auth/auth.middleware.js";

const router = Router();

router.post("/", postOrder);

export default router;