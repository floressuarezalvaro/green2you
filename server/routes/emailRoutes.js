const express = require("express");

const { getAllEmails } = require("../controllers/emailController");

const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

router.get("/", getAllEmails);

module.exports = router;
