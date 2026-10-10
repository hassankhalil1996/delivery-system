import { Router } from "express";
import { postLogin, getMe, postLogout } from "./auth.controller.js";



const router = Router();

router.post("/login", postLogin);
router.get("/me", getMe);
router.post("/logout", postLogout);

export default router;