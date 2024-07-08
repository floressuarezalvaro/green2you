const express = require("express");

const { requireAdminAuth } = require("../middleware/requireAdminOrClientAuth");

const {
  loginUser,
  signUpUser,
  signUpClient,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  resetPassword,
  forgotPassword,
  resetPasswordWithToken,
} = require("../controllers/userController");

const router = express.Router();

router.post("/login", loginUser);
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword/:token", resetPasswordWithToken);
router.post("/resetpassword", resetPassword);

router.use(requireAdminAuth);

router.post("/signup", signUpUser);
router.post("/signup-client", signUpClient);
router.get("/", getAllUsers);
router.get("/:id", getUser);
router.delete("/:id", deleteUser);
router.put("/:id", updateUser);

module.exports = router;
