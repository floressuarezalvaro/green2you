const express = require("express");

const requireAuth = require("../middleware/requireAuth");

const { printedInvoices } = require("../controllers/printInvoiceController");

const router = express.Router();

// require auth for invoice routes
router.use(requireAuth);

router.get("/", printedInvoices);

module.exports = router;
