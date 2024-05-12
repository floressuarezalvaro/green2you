const express = require("express");

const {
  createInvoice,
  getAllInvoices,
  getInvoice,
  deleteInvoice,
  updateInvoice,
} = require("../controllers/invoiceController");

const router = express.Router();

router.get("/", getAllInvoices);

router.get("/:id", getInvoice);

router.post("/", createInvoice);

router.delete("/:id", deleteInvoice);

router.put("/:id", updateInvoice);

module.exports = router;
