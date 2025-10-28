const User = require("../models/userModel");
const Client = require("../models/clientModel");

const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const { sendEmail } = require("../utils/emailHandler");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWTSECRET, { expiresIn: "1d" });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);

    res.status(200).json({ email, token, role: user.role, id: user._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const signUpUser = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.signup(email, password, role);
    const token = createToken(user._id);

    res.status(200).json({ email, token, role });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const signUpClient = async (req, res) => {
  const { email, clientId } = req.body;

  if (!email || !clientId) {
    return res.status(400).json({ error: "Email and Client ID are required" });
  }

  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    return res.status(400).json({ error: "Invalid Client ID" });
  }

  try {
    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    await Client.findOneAndUpdate(
      { _id: clientId },
      { $set: { clientWelcomeEmailEnabled: true } }
    );

    const user = await User.signupClient(email, clientId);
    const token = createToken(user._id);
    const setPasswordToken = await User.forgotPassword(email);

    const resetUrl = `${process.env.FRONTEND_URL}/set-password/${setPasswordToken}`;
    const resetLater = `${process.env.FRONTEND_URL}/forgotpassword`;
    const subject = "Access Account - Set Password";
    const text = `Dear ${client.clientName},

You are receiving this because we are inviting you to access your new Green2You account. To access it, please use this link within 24 hours of receiving it: ${resetUrl}.

If you miss this window, you can request a new link by going to: ${resetLater}. Pleae reach out if you have any issues!

Thank you,
Green 2 You`;

    await sendEmail("Password Set", email, subject, text, null);

    res.status(200).json({ email, token, role: user.role });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const user = await User.resetPassword(email, oldPassword, newPassword);
    const token = createToken(user._id);

    res
      .status(200)
      .json({ email, token, message: "Password reset successful" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const token = await User.forgotPassword(email);

    const resetUrl = `${process.env.FRONTEND_URL}/set-password/${token}`;
    const subject = "Password Reset Request";
    const text = `Dear Customer, 

You are receiving this because we received a requested the reset of the password for your account. 

Please click on the following link, or paste this into your browser to complete the process within 24 hours of receiving it: ${resetUrl}
    
Thank you, 
Green 2 You`;

    await sendEmail("Password Reset", email, subject, text, null);

    res.status(200).json({ message: "Password reset link sent to email" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const resetPasswordWithToken = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "New password is required" });
  }

  try {
    await User.resetPassword(null, null, password, token);

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

const getUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "This is not a valid id" });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "No user found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "This is not a valid id" });
  }

  try {
    const user = await User.findOneAndDelete({ _id: id });

    if (!user) {
      return res.status(404).json({ error: "No user found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "This is not a valid id" });
  }

  try {
    const user = await User.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: "No user found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

module.exports = {
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
};
