const express = require("express");

const requireAuth = require("../middleware/requireAuth");

const { printInvoice } = require("../controllers/printInvoiceController");

const router = express.Router();

// require auth for invoice routes
router.use(requireAuth);

router.get("/:clientId", printInvoice);

module.exports = router;
