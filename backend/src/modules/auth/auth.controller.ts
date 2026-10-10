import type { Request, Response } from "express";
import { loginAdmin, getCurrentUser } from "./auth.service.js";

export async function postLogin(req: Request, res: Response) {
  try {
    const { username, password } = req.body ?? {};

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      res.status(400).json({
        error: "Username and password are required",
      });
      return;
    }

    const result = await loginAdmin(username.trim(), password);

    if (!result) {
      res.status(401).json({
        error: "Invalid credentials",
      });
      return;
    }

    res.cookie("session", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: result.expiresAt,
      path: "/",
    });

    res.json({
      message: "Login successful",
      user: result.admin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Login failed",
    });
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      res.status(401).json({
        error: "Not authenticated",
      });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Authentication check failed",
    });
  }
}