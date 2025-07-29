import mongoose from "mongoose";
import logger from "./logger";

const connectDB = async (): Promise<void> => {
  const maxRetries = 5;
  let retries = 0;

  const connectOptions: mongoose.ConnectOptions = {
    bufferCommands: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
  };

  while (retries < maxRetries) {
    try {
      const conn = await mongoose.connect(process.env.DB_URI!, connectOptions);

      logger.info("✅ Database connected successfully", {
        host: conn.connection.host,
        port: conn.connection.port,
        name: conn.connection.name,
      });

      return;
    } catch (error) {
      retries++;
      logger.error(`❌ Database connection attempt ${retries} failed:`, {
        error: (error as Error).message,
        stack: (error as Error).stack,
      });

      if (retries === maxRetries) {
        logger.error(
          "💥 Maximum database connection retries reached. Exiting..."
        );
        process.exit(1);
      }

      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, retries), 30000);
      logger.info(`⏳ Retrying database connection in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Handle connection events
mongoose.connection.on("connected", () => {
  logger.info("📡 Mongoose connected to database");
});

mongoose.connection.on("error", (err) => {
  logger.error("❌ Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  logger.warn("⚠️ Mongoose disconnected from database");
});

export default connectDB;
