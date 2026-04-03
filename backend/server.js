import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./src/app.js";

dotenv.config();

const startServer = async () => {
  await connectDB();
  const port = process.env.PORT || 5000;
  const host = process.env.HOST || "0.0.0.0";

  app.listen(port, host, () => {
    console.log(`Server listening on http://${host}:${port}`);
  });
};

startServer();