import "dotenv/config";
import express from "express";
import cors from "cors";
import articlesRouter from "./routes/article.route";
import authRouter from "./routes/auth.route";
import usersRouter from "./routes/user.route";
import likesRouter from "./routes/like.route";
import tagsRouter from "./routes/tag.route";
import env from "./constant/env";
import createHttpError from "http-errors";
import session from "express-session";
import sessionConfig from "./config/session";
import passport from "passport";
import cron from "node-cron";
import uploadsCleanup from "./utils/uploadsCleanup";
import "./config/passport";
import errorHandler from "./middlewares/errorHandler";
import { NOT_FOUND } from "./constant/httpCode";
import connectToDatabase from "./config/db";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

app.use(session(sessionConfig));
app.use(passport.authenticate("session"));

// Static files serving
app.use(
  "/uploads/in-article-images",
  express.static("uploads/in-article-images")
);
app.use(
  "/uploads/in-comment-images",
  express.static("uploads/in-comment-images")
);
app.use(
  "/uploads/profile-pictures",
  express.static("uploads/profile-pictures")
);

// health check
app.get("/", (_, res) => {
  res.status(200).json({
    status: "healthy",
  });
});

// API routes
app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/articles", articlesRouter);
app.use("/tags", tagsRouter);
app.use("/interact", likesRouter);

// cleanup uploads
cron.schedule("0 0 * * *", uploadsCleanup);

// generic error handler
app.use((req, res, next) => next(createHttpError(NOT_FOUND, "404 Not found")));
app.use(errorHandler);

// Server
app.listen(env.PORT, async () => {
  console.log(
    `Server is running on port ${env.PORT} in ${env.NODE_ENV} environment.`
  );
  await connectToDatabase();
});

export default app;
