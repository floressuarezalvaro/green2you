const dotenv = require("dotenv");
const path = require("path");

const envFile = path.resolve(
  __dirname,
  process.env.NODE_ENV === "production"
    ? "../.env.production"
    : "../.env.development"
);
dotenv.config({ path: envFile });

const mongoose = require("mongoose");
const statementScheduler = require("./statementScheduler");

(async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables.");
    }

    await mongoose
      .connect(process.env.MONGO_URI)
      .then(() => {
        console.log("Connected to MongoDB");
      })
      .catch((error) => {
        console.warn("Error:", error);
      });

    await statementScheduler();
    console.log("Scheduler ran successfully.");
  } catch (error) {
    console.error("Scheduler encountered an error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
})();
