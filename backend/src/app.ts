// src/app.ts

import express from "express";
import cors from "cors";


import businessRoutes from "./modules/businesses/business.routes.js";
import orderRoutes from "./modules/orders/order.routes.js";

import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Delivery API is running",
  });
});

app.use("/businesses", businessRoutes);
app.use("/orders", orderRoutes);

app.use(cookieParser());
app.use("/auth", authRoutes);

export default app;