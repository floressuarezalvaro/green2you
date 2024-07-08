const express = require("express");

const {
  createBalance,
  getBalance,
  getAllBalances,
  updateBalance,
  deleteBalance,
} = require("../controllers/balanceController");

const {
  requireAdminAuth,
  requireClientAuth,
} = require("../middleware/requireAdminOrClientAuth");

const router = express.Router();

router.get("/client/:id", requireClientAuth, getBalance);

router.use(requireAdminAuth);

router.post("/:id", createBalance);
router.get("/", getAllBalances);
router.put("/:id", updateBalance);
router.delete("/:id", deleteBalance);

module.exports = router;
