const express = require("express");

const requireAPIKeyOrAuth = require("../middleware/requireAPIKeyOrAuth");

const {
  requireAdminAuth,
  requireClientAuth,
} = require("../middleware/requireAdminOrClientAuth");

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

router.get("/client/:clientId", requireClientAuth, getAllClientStatements);

router.use(requireAdminAuth);

router.get("/", getAllStatements);
router.get("/:id", getStatement);
router.delete("/:id", deleteStatement);
router.put("/:id", updateStatement);

module.exports = router;
