import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});

export const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many submissions from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false
});

export const authLoginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: "Too many incorrect login attempts. Try again after 10 minutes.",
  standardHeaders: true,
  legacyHeaders: false
});

export const authVerificationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: "Too many verification requests. Please try again in a few minutes.",
  standardHeaders: true,
  legacyHeaders: false
});
