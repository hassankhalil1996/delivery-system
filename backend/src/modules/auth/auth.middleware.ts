import type { Request, Response, NextFunction } from "express";
import { getCurrentUser } from "./auth.service.js";

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {

    const user = await getCurrentUser(req);

    if (!user || user.role !== "ADMIN") {
      res.status(401).json({
        error: "Admin authentication required",
      });
      return;
    }

    next();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Authentication check failed",
    });
  }
}