import mongoose from "mongoose";
import app from "./app";
import env from "./env";

const port = env.PORT;

mongoose
  .connect(env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server is running on port: ${env.PORT}`);
    });
  })
  .catch(console.error);
