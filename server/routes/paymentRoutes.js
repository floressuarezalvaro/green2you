const express = require("express");

const {
  makePayment,
  getAllPayments,
  getPaymentsByClient,
} = require("../controllers/paymentsController");

const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// require auth for invoice routes
router.use(requireAuth);

router.post("/", makePayment);
router.get("/", getAllPayments);
router.get("/client/:clientId", getPaymentsByClient);

module.exports = router;
