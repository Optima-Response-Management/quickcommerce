import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { env } from "./config/env";
import routes from "./routes";
import {
  errorHandler,
  notFound,
} from "./middlewares/error.middleware";

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = new Set(
  env.CLIENT_URLS.split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean),
);

const developmentOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header, such as health checks.
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = origin.replace(/\/+$/, "");

      if (allowedOrigins.has(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      if (
        env.NODE_ENV !== "production" &&
        developmentOrigins.has(normalizedOrigin)
      ) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-CSRF-Token",
    ],

    optionsSuccessStatus: 204,
  }),
);

// Parse cookies before authentication middleware runs.
app.use(cookieParser());

app.use(express.json({ limit: "1mb" }));

app.use(
  express.urlencoded({
    extended: false,
    limit: "1mb",
  }),
);

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;