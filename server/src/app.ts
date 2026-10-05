import express from "express";
import cors from "cors";
import { env } from "./config/env";
import routes from "./routes";
import { errorHandler, notFound } from "./middlewares/error.middleware";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;