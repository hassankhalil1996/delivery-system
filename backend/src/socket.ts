
import type { Server as HttpServer } from "node:http";
import type { Request } from "express";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";

import { getCurrentUser } from "./modules/auth/auth.service.js";

type AuthenticatedUser = NonNullable<
  Awaited<ReturnType<typeof getCurrentUser>>
>;

let io: Server | null = null;

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // Authenticate every Socket.IO connection.
  io.use(async (socket, next) => {
    try {
      // Read cookies from the Socket.IO handshake.
      const cookieHeader = socket.request.headers.cookie ?? "";

      const cookies = cookieParser.JSONCookies(
        cookieParser.signedCookies(
          {},
          "unused"
        )
      );

      // Parse the session cookie directly from the header.
      const sessionCookie = cookieHeader
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith("session="));

      if (!sessionCookie) {
        return next(new Error("Authentication required"));
      }

      const sessionToken = decodeURIComponent(
        sessionCookie.slice("session=".length)
      );

      // Reuse existing Express authentication logic.
      const authRequest = {
        cookies: {
            session: sessionToken,
        },
        } as unknown as Request;

      const user = await getCurrentUser(authRequest);

      if (!user) {
        return next(new Error("Authentication required"));
      }

      socket.data.user = user;

      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as AuthenticatedUser;

    console.log(
      `Socket connected: ${user.role} ${user.id}`
    );

    // Join rooms based on the authenticated role.
    if (user.role === "COURIER") {
      socket.join("couriers");
      socket.join(`courier:${user.id}`);
    }

    if (user.role === "BUSINESS") {
      socket.join(`business:${user.id}`);
    }

    if (user.role === "ADMIN") {
      socket.join("admins");
    }

    socket.on("disconnect", (reason) => {
      console.log(
        `Socket disconnected: ${user.role} ${user.id} (${reason})`
      );
    });
  });

  return io;
}

export function getSocketIO(): Server {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
}
