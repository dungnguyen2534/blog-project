import "dotenv/config";
import express from "express";
import postsRouter from "./routes/posts";

const app = express();
app.use(express.json());

app.use("/posts", postsRouter);

export default app;
