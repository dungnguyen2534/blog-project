import mongoose from "mongoose";
import env from "../constant/env";

const connectToDatabase = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("Connected to database.");
  } catch (error) {
    console.log("Could not connect to database: ", error);
    process.exit(1); // shutdown server if can't connect to database
  }
};

export default connectToDatabase;
