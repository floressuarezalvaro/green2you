const express = require("express");

const {
  makePayment,
  getAllPayments,
  getPaymentsByClient,
  getPaymentsById,
  updatePayment,
  deletePayment,
} = require("../controllers/paymentsController");

const {
  requireAdminAuth,
  requireClientAuth,
} = require("../middleware/requireAdminOrClientAuth");

const router = express.Router();

router.get("/client/:clientId", requireClientAuth, getPaymentsByClient);

router.use(requireAdminAuth);

router.post("/", makePayment);
router.get("/", getAllPayments);
router.get("/:id", getPaymentsById);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);

module.exports = router;
