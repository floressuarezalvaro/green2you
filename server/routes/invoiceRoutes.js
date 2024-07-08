const express = require("express");

const {
  createInvoice,
  getAllInvoices,
  getAllClientInvoices,
  getInvoice,
  deleteInvoice,
  updateInvoice,
} = require("../controllers/invoiceController");

const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);
router.get("/", getAllInvoices);
router.get("/client/:id", getAllClientInvoices);

router.get("/:id", getInvoice);
router.post("/", createInvoice);
router.delete("/:id", deleteInvoice);
router.put("/:id", updateInvoice);

module.exports = router;
