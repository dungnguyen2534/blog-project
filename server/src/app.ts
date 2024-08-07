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
import "./config/passport-signin";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use(
  cors({
    origin: env.CLIENT_URL,
  })
);

app.use(session(sessionConfig));
app.use(passport.authenticate("session"));

app.use("/users", usersRouter);
app.use("/posts", postsRouter);

app.use((req, res, next) => next(createHttpError(404, "404 Not found")));
app.use(errorHandler);

export default app;
