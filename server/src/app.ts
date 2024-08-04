import "dotenv/config";
import express from "express";
import cors from "cors";
import postsRouter from "./routes/posts";
import env from "./env";
import morgan from "morgan";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use(
  cors({
    origin: env.CLIENT_URL,
  })
);

app.use("/posts", postsRouter);

export default app;
