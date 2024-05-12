const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// static signup method
userSchema.statics.signup = async function (email, password) {
  // validation

  if (!email || !password) {
    throw Error("Email or Password is missing");
  }
  if (!validator.isEmail(email)) {
    throw Error("This is not a valid email");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error("This password is not strong enough");
  }

  const exists = await this.findOne({ email });

  if (exists) {
    throw Error("Email exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await this.create({ email, password: hash });

  return user;
};

// static login method
userSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error("Email or Password is missing");
  }

  const user = await this.findOne({ email });

  if (!user) {
    throw Error("Invalid login credential");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw Error("Invalid login credentials");
  }
  return user;
};

module.exports = mongoose.model("User", userSchema);
