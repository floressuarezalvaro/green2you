const express = require("express");

const requireAuth = require("../middleware/requireAuth");
const requireAPIKeyOrAuth = require("../middleware/requireAPIKeyOrAuth");

const {
  createStatement,
  getAllStatements,
  getAllClientStatements,
  getStatement,
  deleteStatement,
  updateStatement,
} = require("../controllers/statementsController");

const { printStatement } = require("../utils/PDFCreator");

const router = express.Router();

router.get("/print/:id", requireAPIKeyOrAuth, printStatement);
router.post("/", requireAPIKeyOrAuth, createStatement);

router.use(requireAuth);

router.get("/", getAllStatements);
router.get("/client/:clientId", getAllClientStatements);
router.get("/:id", getStatement);
router.delete("/:id", deleteStatement);
router.put("/:id", updateStatement);

module.exports = router;
