
import type { Server as HttpServer } from "node:http";
import type { Request } from "express";
import { Server } from "socket.io";

import { getCurrentUser } from "./modules/auth/auth.service.js";
import { getRestaurantOrderTracking } from "./modules/restaurant-orders/restaurant-order.service.js";

type AuthenticatedUser = NonNullable<
  Awaited<ReturnType<typeof getCurrentUser>>
>;

type CustomerTracking = {
  orderId: number;
};

let io: Server | null = null;

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      process.env.FRONTEND_URL,
      process.env.CUSTOMER_FRONTEND_URL,
    ].filter((origin): origin is string => Boolean(origin)),
    credentials: true,
  },

  });

  io.use(async (socket, next) => {
    try {
      // Customers authenticate using their private tracking token.
      const trackingToken = socket.handshake.auth?.trackingToken;

      if (typeof trackingToken === "string") {
        const order = await getRestaurantOrderTracking(trackingToken);

        if (!order) {
          return next(new Error("Invalid tracking token"));
        }

        socket.data.customerTracking = {
          orderId: order.id,
        } satisfies CustomerTracking;

        return next();
      }

      // Existing business, courier and admin authentication.
      const cookieHeader = socket.request.headers.cookie ?? "";

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
    const customerTracking = socket.data
      .customerTracking as CustomerTracking | undefined;

    if (customerTracking) {
      socket.join(`restaurant-order:${customerTracking.orderId}`);

      console.log(
        `Customer tracking connected: order ${customerTracking.orderId}`
      );

      return;
    }

    const user = socket.data.user as AuthenticatedUser;

    console.log(`Socket connected: ${user.role} ${user.id}`);

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
