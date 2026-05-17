import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./src/app.js";

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();

    const port = process.env.PORT || 5000;
    const host = process.env.HOST || "0.0.0.0";

    app.listen(port, host, () => {
      console.log(`Server listening on http://${host}:${port}`);
    });
  } catch (error) {
    console.error(error);
  }
};

if (process.env.NODE_ENV !== "production") {
  startServer();
}

export default app;