const express = require("express");
const mongoose = require("mongoose");
const cron = require("node-cron");
const dotenv = require("dotenv");
const path = require("path");

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
dotenv.config({ path: envFile });

if (process.env.NODE_ENV === "development") {
  console.log("You're in development mode!");
} else {
  console.log("You're in production mode!");
}

const invoiceRoutes = require("./routes/invoiceRoutes");
const userRoutes = require("./routes/userRoutes");
const clientRoutes = require("./routes/clientRoutes");
const emailRoutes = require("./routes/emailRoutes");
const statementsRoutes = require("./routes/statementsRoutes");
const balanceRoutes = require("./routes/balanceRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const monthlyStatements = require("./utils/statementScheduler");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.use("/api/invoices", invoiceRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/users", userRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/statements", statementsRoutes);
app.use("/api/balances", balanceRoutes);
app.use("/api/payments", paymentRoutes);

app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(404).json({ message: "API route not found" });
  }
  next();
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const connectWithRetry = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      app.listen(process.env.PORT, () => {
        console.log("Connected to db & listening on port", process.env.PORT);
      });
      cron.schedule("* * * * *", monthlyStatements);
    })
    .catch((error) => {
      console.error(
        "Database connection failed, retrying in 5 seconds...",
        error
      );
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();
