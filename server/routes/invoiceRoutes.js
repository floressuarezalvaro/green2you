const express = require("express");

const {
  createInvoice,
  getAllInvoices,
  getAllClientInvoices,
  getInvoice,
  deleteInvoice,
  updateInvoice,
} = require("../controllers/invoiceController");

const {
  requireAdminAuth,
  requireClientAuth,
} = require("../middleware/requireAdminOrClientAuth");

const router = express.Router();

router.get("/client/:id", requireClientAuth, getAllClientInvoices);

router.use(requireAdminAuth);

router.get("/", getAllInvoices);
router.get("/:id", getInvoice);
router.post("/", createInvoice);
router.delete("/:id", deleteInvoice);
router.put("/:id", updateInvoice);

module.exports = router;
