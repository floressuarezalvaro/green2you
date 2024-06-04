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

//TODO: Get statements by clientId and createdDate
router.get("/:clientId/:createdDate", getStatement);
router.get("/:clientId", getAllStatements);
router.post("/", createStatement);
router.delete("/:id", deleteStatement);
router.put("/:id", updateStatement);

module.exports = router;
