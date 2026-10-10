import { Router } from "express";
import { postOrder } from "./order.controller.js";

const router = Router();

router.post("/", postOrder);

export default router;