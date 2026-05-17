import serverless from "serverless-http";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./src/app.js";

dotenv.config();

let isConnected = false;

const connectToDatabase = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
    console.log("MongoDB connected");
  }
};

const handler = async (event, context) => {
  await connectToDatabase();

  const serverlessHandler = serverless(app);

  return serverlessHandler(event, context);
};

export { handler };