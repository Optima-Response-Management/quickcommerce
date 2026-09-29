import rateLimit from "express-rate-limit";

export const signInLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10, // 10 attempts per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many sign-in attempts. Try again in 15 minutes.",
    });
  },
});