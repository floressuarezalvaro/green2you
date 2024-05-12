const express = require("express");

//controller functions
const { loginUser, signUpUser } = require("../controllers/userController");

const router = express.Router();

// login routes
router.post("/login", loginUser);

// signup routes
router.post("/signup", signUpUser);

module.exports = router;
