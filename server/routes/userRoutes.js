const express = require("express");

//controller functions
const {
  loginUser,
  signUpUser,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  resetUserPassword,
} = require("../controllers/userController");

const router = express.Router();

router.post("/login", loginUser);
router.post("/signup", signUpUser);

router.get("/", getAllUsers);
router.get("/:id", getUser);
router.delete("/:id", deleteUser);
router.put("/:id", updateUser);
router.post("/resetpassword", resetUserPassword);

module.exports = router;
