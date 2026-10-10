// src/modules/businesses/business.routes.ts

import { Router } from "express";
import { getBusinesses } from "./business.controller.js";

const router = Router();

router.get("/", getBusinesses);

export default router;