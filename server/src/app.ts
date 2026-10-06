import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import routes from "./routes";
import { errorHandler, notFound } from "./middlewares/error.middleware";

const app = express();

const allowedOrigins = env.CLIENT_URLS.split(",").map((o) => o.trim());

// localhost + private network ranges (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
const privateNetwork =
  /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

app.use(
  cors({
    origin: (origin, callback) => {
      // No Origin header = Apidog, curl, health checks. Auth still protects the routes.
      if (!origin) return callback(null, true);

      // Exact URLs from CLIENT_URLS always work (production domain goes here)
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // Any local network address, development only
      if (env.NODE_ENV !== "production" && privateNetwork.test(origin)) {
        return callback(null, true);
      }

      // Not allowed: no CORS headers are sent, so the browser blocks it
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;