import "dotenv/config";
import express from "express";
import cors from "cors";
import postsRouter from "./routes/posts";
import usersRouter from "./routes/users";
import env from "./env";
import morgan from "morgan";
import errorHandler from "./middlewares/errorHandler";
import createHttpError from "http-errors";
import session from "express-session";
import sessionConfig from "./config/session";
import passport from "passport";
import cron from "node-cron";
import uploadsCleanup from "./utils/uploadsCleanup";
import "./config/passport";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

app.use(session(sessionConfig));
app.use(passport.authenticate("session"));

app.use("/uploads/in-post-images", express.static("uploads/in-post-images"));
app.use(
  "/uploads/profile-pictures",
  express.static("uploads/profile-pictures")
);

app.use("/auth", usersRouter);
app.use("/posts", postsRouter);

cron.schedule("0 0 * * *", uploadsCleanup); // Every day at midnight
app.use((req, res, next) => next(createHttpError(404, "404 Not found")));
app.use(errorHandler);

export default app;
