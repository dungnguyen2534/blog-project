import { SessionOptions } from "express-session";
import env from "../env";
import RedisStore from "connect-redis";
import crypto from "crypto";
import redisClient from "./redisClient";

const sessionConfig: SessionOptions = {
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }, // 1 week
  rolling: true, // reset maxAge on every request

  store: new RedisStore({ client: redisClient }),

  // generate random session id prefix with id of the user
  // if user reset their password, find and invalidate all session that has the prefix of that user id with regex(invalidateSessions.ts)
  genid(req) {
    const userId = req.user?._id;
    const randomId = crypto.randomUUID();
    if (userId) {
      return `${userId}-${randomId}`;
    } else {
      return randomId;
    }
  },
};

export default sessionConfig;
