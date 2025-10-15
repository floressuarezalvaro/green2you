const express = require("express");
const router = express.Router();

const balanceRoutes = require("./balanceRoutes");
const clientRoutes = require("./clientRoutes");
const emailRoutes = require("./emailRoutes");
const invoiceRoutes = require("./invoiceRoutes");
const paymentRoutes = require("./paymentRoutes");
const statementsRoutes = require("./statementsRoutes");
const userRoutes = require("./userRoutes");
const versionRoutes = require("./versionRoutes");

const setLimit = require("../utils/setLimit");
const defaultLimit = setLimit();

router.use("/balances", defaultLimit, balanceRoutes);
router.use("/clients", defaultLimit, clientRoutes);
router.use("/emails", defaultLimit, emailRoutes);
router.use("/invoices", defaultLimit, invoiceRoutes);
router.use("/payments", defaultLimit, paymentRoutes);
router.use("/statements", defaultLimit, statementsRoutes);
router.use("/users", setLimit(10), userRoutes);
router.use("/version", defaultLimit, versionRoutes);

module.exports = router;
