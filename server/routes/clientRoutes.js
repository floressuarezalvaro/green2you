const express = require("express");

const {
  getAllClients,
  createClient,
  getClient,
  deleteClient,
  updateClient,
} = require("../controllers/clientController");

const {
  requireAdminAuth,
  requireClientAuth,
} = require("../middleware/requireAdminOrClientAuth");

const router = express.Router();

router.get("/:id", requireClientAuth, getClient);

router.use(requireAdminAuth);

router.get("/", getAllClients);
router.post("/", createClient);
router.delete("/:id", deleteClient);
router.put("/:id", updateClient);

module.exports = router;
