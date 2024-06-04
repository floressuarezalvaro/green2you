const express = require("express");

const requireAuth = require("../middleware/requireAuth");

const {
  printStatement,
  createStatement,
  getAllStatements,
  getStatement,
  deleteStatement,
  updateStatement,
} = require("../controllers/statementsController");

const router = express.Router();

// require auth for invoice routes
router.use(requireAuth);

router.get("/print/:id", printStatement);

router.get("/client/:clientId", getAllStatements);

router.get("/:id", getStatement);
router.post("/", createStatement);
router.delete("/:id", deleteStatement);
router.put("/:id", updateStatement);

module.exports = router;
