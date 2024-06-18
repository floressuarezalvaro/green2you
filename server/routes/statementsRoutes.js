const express = require("express");

const requireAuth = require("../middleware/requireAuth");
const requireAPIKey = require("../middleware/requireAPIKey");

const {
  printStatement,
  createStatement,
  getAllStatements,
  getStatement,
  deleteStatement,
  updateStatement,
} = require("../controllers/statementsController");

const router = express.Router();

router.get("/print/:id", printStatement);

router.post("/", requireAPIKey, createStatement);

router.use(requireAuth);

router.get("/client/:clientId", getAllStatements);
router.get("/:id", getStatement);
router.delete("/:id", deleteStatement);
router.put("/:id", updateStatement);

module.exports = router;
