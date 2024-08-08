import { SessionOptions } from "express-session";
import env from "../env";
import MongoStore from "connect-mongo";

const sessionConfig: SessionOptions = {
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }, // 1 week
  rolling: true, // reset maxAge on every request

  store: MongoStore.create({
    mongoUrl: env.MONGODB_URI,
  }),
};

export default sessionConfig;
