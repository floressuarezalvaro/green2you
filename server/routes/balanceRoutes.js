const express = require("express");

const {
  createBalance,
  getBalance,
} = require("../controllers/balanceController");

const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// require auth for invoice routes
router.use(requireAuth);

router.post("/:id", createBalance);
router.get("/:id", getBalance);

module.exports = router;
