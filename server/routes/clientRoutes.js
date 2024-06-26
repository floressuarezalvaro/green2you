const express = require("express");

const {
  getAllClients,
  createClient,
  getClient,
  getProfile,
  deleteClient,
  updateClient,
} = require("../controllers/clientController");

const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// require auth for invoice routes
router.use(requireAuth);

router.get("/", getAllClients);

router.get("/:id", getClient);

router.get("/profile/:clientId", getProfile);

router.post("/", createClient);

router.delete("/:id", deleteClient);

router.put("/:id", updateClient);

module.exports = router;
