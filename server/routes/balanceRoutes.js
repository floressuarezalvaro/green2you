const express = require("express");

const {
  createBalance,
  getBalance,
  getAllBalances,
  updateBalance,
  deleteBalance,
} = require("../controllers/balanceController");

const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// require auth for invoice routes
router.use(requireAuth);

router.post("/:id", createBalance);
router.get("/:id", getBalance);
router.get("/", getAllBalances);
router.put("/:id", updateBalance);
router.delete("/:id", deleteBalance);

module.exports = router;
