const path = require("path");
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");

const { isProd } = require("./config/environment");
const apiRoutes = require("./routes");

const app = express();

app.set("trust proxy", isProd ? 1 : "loopback");
app.use(helmet());
app.use(express.json());
app.use(mongoSanitize({ replaceWith: "_" }));
app.use(cors({ origin: "https://www.green-2-you.com" }));

app.use("/api", apiRoutes);

if (isProd) {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
  });
}

app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

module.exports = app;
