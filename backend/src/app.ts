// src/app.ts

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./modules/auth/auth.routes.js";
import businessRoutes from "./modules/businesses/business.routes.js";
import orderRoutes from "./modules/orders/order.routes.js";
import courierRoutes from "./modules/couriers/courier.routes.js";
import pricingRoutes from "./modules/pricing/pricing.routes.js";
import restaurantOrderRoutes from "./modules/restaurant-orders/restaurant-order.routes.js";

import restaurantOrderBusinessRoutes from "./modules/restaurant-orders/restaurant-order.business.routes.js";



const app = express();


const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
  process.env.CUSTOMER_FRONTEND_URL,
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());



app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Delivery API is running",
  });
});

app.use("/auth", authRoutes);
app.use("/businesses", businessRoutes);
app.use("/orders", orderRoutes);
app.use("/couriers", courierRoutes);
app.use("/pricing", pricingRoutes);
app.use("/public/restaurant-orders", restaurantOrderRoutes);

app.use(
  "/restaurant/orders",
  restaurantOrderBusinessRoutes
);


export default app;