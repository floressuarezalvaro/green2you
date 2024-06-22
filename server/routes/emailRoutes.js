const express = require("express");

const {
  getAllEmails,
  sendManualStatementEmail,
} = require("../controllers/emailController");

const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

router.get("/", getAllEmails);
router.post("/manual-statement-email", sendManualStatementEmail);

module.exports = router;
