import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./src/app.js";

dotenv.config();

const startServer = async () => {
  await connectDB();
  const port = process.env.PORT || 5000;

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer();