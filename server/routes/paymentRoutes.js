const express = require("express");

const {
  makePayment,
  getAllPayments,
  getPaymentsByClient,
  getPaymentsById,
  deletePayment,
} = require("../controllers/paymentsController");

const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// require auth for invoice routes
router.use(requireAuth);

router.post("/", makePayment);
router.get("/", getAllPayments);
router.get("/client/:clientId", getPaymentsByClient);
router.get("/:id", getPaymentsById);
router.delete("/:id", deletePayment);

module.exports = router;
