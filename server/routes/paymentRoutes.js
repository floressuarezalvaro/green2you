const express = require("express");

const { makePayment } = require("../controllers/paymentsController");

const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// require auth for invoice routes
router.use(requireAuth);

router.post("/", makePayment);

module.exports = router;
