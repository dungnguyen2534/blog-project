import rateLimit from "express-rate-limit";

export const signinLimiter = rateLimit({
  windowMs: 3 * 60 * 60 * 1000,
  max: 10,
  message: "Too many login attempts, please try again later",

  standardHeaders: true,
  legacyHeaders: false,

  skipSuccessfulRequests: true,
});

export const OTPRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,

  standardHeaders: true,
  legacyHeaders: false,

  skipFailedRequests: true,
});

export const createArticleLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,

  standardHeaders: true,
  legacyHeaders: false,

  skipFailedRequests: true,
});

export const updateArticleLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,

  standardHeaders: true,
  legacyHeaders: false,

  skipFailedRequests: true,
});
export const uploadImagesLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,

  standardHeaders: true,
  legacyHeaders: false,

  skipFailedRequests: true,
});
