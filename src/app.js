// server.js or app.js
import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import sso from "./routes/sso.js";
import bookRoutes from "./routes/bookRoutes.js";
import pages from "./routes/pages.js";
import { connectDB } from "./lib/db.js";
import dotenv from "dotenv";
import sessionConfig from "./lib/sessionConfig.js"; // ✅ Import your modular session config
import Deposition from "./models/Deposition.js";
import deposition from "./routes/essential_functionalities/deposition.js";
import preferences from "./routes/essential_functionalities/preferences.js";

dotenv.config();

const createApp = () => {
  const app = express();

  const PORT = process.env.PORT || 3000;

  // Middlewares
  app.use(express.json());

  app.use(
    cors({
      origin: true, // You can replace with specific origin like "http://localhost:3000"
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "query", "aaa"],
    })
  );

  app.use(cookieParser());

  app.use(sessionConfig); // ✅ Use the modular session config

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/books", bookRoutes);
  app.use("", pages);
  app.use("/auth", sso);
  app.use("/fct", deposition);
  app.use("/fct", preferences);

  return { app, PORT };
};

export default createApp;
