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




const app = express();

app.use(cors());
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



export default app;