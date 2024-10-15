import "dotenv/config";
import express from "express";
import cors from "cors";
import postsRouter from "./routes/posts";
import usersRouter from "./routes/users";
import likesRouter from "./routes/likes";
import tagsRouter from "./routes/tags";
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

// Static files serving
app.use("/uploads/in-post-images", express.static("uploads/in-post-images"));
app.use(
  "/uploads/in-comment-images",
  express.static("uploads/in-comment-images")
);
app.use(
  "/uploads/profile-pictures",
  express.static("uploads/profile-pictures")
);

// API routes
app.use("/auth", usersRouter);
app.use("/posts", postsRouter);
app.use("/tags", tagsRouter);
app.use("/", likesRouter);

// Schedule uploads cleanup every day ad midnight
cron.schedule("0 0 * * *", uploadsCleanup);

// 404 Not found
app.use((req, res, next) => next(createHttpError(404, "404 Not found")));

// Generic error handler
app.use(errorHandler);

export default app;
