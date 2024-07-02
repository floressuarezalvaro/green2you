const express = require("express");

const requireAuth = require("../middleware/requireAuth");

const {
  loginUser,
  signUpUser,
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

router.use(requireAuth);

router.post("/signup", signUpUser);
router.post("/resetpassword", resetPassword);
router.get("/", getAllUsers);
router.get("/:id", getUser);
router.delete("/:id", deleteUser);
router.put("/:id", updateUser);

module.exports = router;
