require("./config/environment");
const connectDB = require("./config/database");
const app = require("./app");

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Server listening on port", process.env.PORT);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
