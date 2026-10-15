
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
    .map((origin) => origin.trim())
    .filter(Boolean)
);

const privateNetwork =
  /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header are allowed through CORS.
      // Authentication and authorization still protect private routes.
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      if (
        env.NODE_ENV !== "production" &&
        privateNetwork.test(origin)
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
  })
);

app.use(cookieParser());

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({
  extended: false,
  limit: "1mb",
}));

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
