
import type { Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import { createCourier } from "./courier.service.js";

export async function postCourier(req: Request, res: Response) {
  try {
    const { name, username, password } = req.body ?? {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof username !== "string" ||
      !username.trim() ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      res.status(400).json({
        error: "Name, username and password (min 8 characters) are required",
      });
      return;
    }

    const courier = await createCourier(
      name.trim(),
      username.trim(),
      password
    );

    res.status(201).json(courier);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(409).json({
        error: "Username already exists",
      });
      return;
    }

    console.error(error);
    res.status(500).json({
      error: "Failed to create courier",
    });
  }
}
