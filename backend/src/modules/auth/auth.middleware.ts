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


export async function requireBusiness(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (user.role !== "BUSINESS") {
      res.status(403).json({ error: "Business access required" });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}


export async function requireCourier(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      res.status(401).json({
        error: "Authentication required",
      });
      return;
    }

    if (user.role !== "COURIER") {
      res.status(403).json({
        error: "Courier access required",
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}
