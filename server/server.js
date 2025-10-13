const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const setLimit = require("./utils/setLimit");
const helmet = require("helmet");
const cors = require("cors");

const ENV = process.env.NODE_ENV || "development";
const isProd = ENV === "production";
const isDev = ENV === "development";
console.log(`You're in ${ENV} mode!`);

dotenv.config({ path: isProd ? ".env.production" : ".env.development" });

const invoiceRoutes = require("./routes/invoiceRoutes");
const userRoutes = require("./routes/userRoutes");
const clientRoutes = require("./routes/clientRoutes");
const emailRoutes = require("./routes/emailRoutes");
const statementsRoutes = require("./routes/statementsRoutes");
const balanceRoutes = require("./routes/balanceRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
app.set("trust proxy", isProd ? 1 : "loopback");

app.use(express.json());
app.use(helmet());
app.use(cors({ origin: "https://www.green-2-you.com" }));

const defaultLimit = setLimit();

app.use("/api/invoices", defaultLimit, invoiceRoutes);
app.use("/api/clients", defaultLimit, clientRoutes);
app.use("/api/users", setLimit(10), userRoutes);
app.use("/api/emails", defaultLimit, emailRoutes);
app.use("/api/statements", defaultLimit, statementsRoutes);
app.use("/api/balances", defaultLimit, balanceRoutes);
app.use("/api/payments", defaultLimit, paymentRoutes);

app.get("/api/version", (req, res) => {
  const backendVersion = require("./package.json").version;
  const frontendVersion = require("../frontend/package.json").version;

  res.json({
    backend: backendVersion,
    frontend: frontendVersion,
    environment: ENV,
  });
});

if (isProd) {
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
