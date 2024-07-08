const express = require("express");

const {
  getAllEmails,
  sendManualStatementEmail,
} = require("../controllers/emailController");

const { requireAdminAuth } = require("../middleware/requireAdminOrClientAuth");

const router = express.Router();

router.use(requireAdminAuth);

router.get("/", getAllEmails);
router.post("/manual-statement-email", sendManualStatementEmail);

module.exports = router;
