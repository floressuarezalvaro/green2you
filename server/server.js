require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cron = require("node-cron");

const invoiceRoutes = require("./routes/invoiceRoutes");
const userRoutes = require("./routes/userRoutes");
const clientRoutes = require("./routes/clientRoutes");
const emailRoutes = require("./routes/emailRoutes");
const statementsRoutes = require("./routes/statementsRoutes");
const balanceRoutes = require("./routes/balanceRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const generateMonthlyStatements = require("./utils/statementScheduler");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.use("/invoices", invoiceRoutes);
app.use("/clients", clientRoutes);
app.use("/users", userRoutes);
app.use("/emails", emailRoutes);
app.use("/statements", statementsRoutes);
app.use("/balances", balanceRoutes);
app.use("/payments", paymentRoutes);

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
