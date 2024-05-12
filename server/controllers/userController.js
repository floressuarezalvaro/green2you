// const User = require("../models/userModel");

//login user
const loginUser = async (req, res) => {
  res.json({ mssg: "login user" });
};
// signup user
const signUpUser = async (req, res) => {
  res.json({ mssg: "user signed up" });
};

module.exports = { loginUser, signUpUser };
