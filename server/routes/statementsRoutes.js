const express = require("express");

const requireAuth = require("../middleware/requireAuth");

const { printStatement } = require("../controllers/statementsController");

const router = express.Router();

// require auth for invoice routes
router.use(requireAuth);

router.get("/:clientId", printStatement);

module.exports = router;
