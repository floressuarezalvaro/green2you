const mongoose = require("mongoose");

const connectWithRetry = () => {
  return mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to database");
    })
    .catch((error) => {
      console.error(
        "Database connection failed, retrying in 5 seconds...",
        error
      );
      setTimeout(connectWithRetry, 5000);
    });
};

module.exports = connectWithRetry;
