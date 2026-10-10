import { Router } from "express";
import { postLogin, getMe } from "./auth.controller.js";

const router = Router();

router.post("/login", postLogin);
router.get("/me", getMe);

export default router;