const express = require("express");
const { ENV } = require("../config/environment");

const router = express.Router();

router.get("/", (req, res) => {
  const backendVersion = require("../package.json").version;
  const frontendVersion = require("../../frontend/package.json").version;

  res.json({
    backend: backendVersion,
    frontend: frontendVersion,
    environment: ENV,
  });
});

module.exports = router;
