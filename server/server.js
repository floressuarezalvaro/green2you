const express = require("express");
const mongoose = require("mongoose");
const cron = require("node-cron");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");

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
const generateMonthlyStatements = require("./utils/statementScheduler");

const app = express();

app.set("trust proxy", 1);
app.use(express.json());

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? "https://www.green-2-you.com"
      : "http://localhost:3000",
  methods: "GET,PUT,POST,DELETE",
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use((req, res, next) => {
  console.log(req.path, req.method);
  // Log request headers

  if (req.path != "/favicon.ico") {
    console.log("Headers:", req.headers);
  }

  // Log the authorization header specifically if present
  if (req.headers.authorization) {
    console.log("Authorization:", req.headers.authorization);
  } else {
    console.log("Authorization header missing");
  }

  next();
});

app.use("/invoices", invoiceRoutes);
app.use("/clients", clientRoutes);
app.use("/users", userRoutes);
app.use("/emails", emailRoutes);
app.use("/statements", statementsRoutes);
app.use("/balances", balanceRoutes);
app.use("/payments", paymentRoutes);

app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(404).json({ message: "API route not found" });
  }
  next();
});

if (process.env.NODE_ENV === "production") {
  // Serve static files for React app
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  // Catch-all handler for client-side routing (React)
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
      cron.schedule("0 0 * * *", generateMonthlyStatements);
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
