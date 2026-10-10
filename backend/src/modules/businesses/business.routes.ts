// src/modules/businesses/business.routes.ts

import { Router } from "express";
import { getBusinesses, postBusiness, } from "./business.controller.js";

const router = Router();

router.get("/", getBusinesses);
router.post("/", postBusiness);

export default router;