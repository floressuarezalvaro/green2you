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
    required: false,
  },
  role: {
    type: String,
    required: true,
    enum: ["admin", "client"],
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// static signup method
userSchema.statics.signup = async function (email, password, role) {
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

  const user = await this.create({ email, password: hash, role });

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

userSchema.statics.resetPassword = async function (
  email,
  oldPassword,
  newPassword,
  token = null
) {
  let user;

  if (token) {
    user = await this.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      throw Error("Invalid or expired password reset token");
    }
  } else {
    if (!email || !oldPassword || !newPassword) {
      throw Error("All fields are required");
    }
    user = await this.findOne({ email });
    if (!user) {
      throw Error("Invalid login credential");
    }
    const oldMatch = await bcrypt.compare(oldPassword, user.password);
    if (!oldMatch) {
      throw Error("Old password is incorrect");
    }
  }

  if (!validator.isStrongPassword(newPassword)) {
    throw Error("New password is not strong enough");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);

  user.password = hash;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return user;
};

userSchema.statics.forgotPassword = async function (email) {
  if (!email) {
    throw Error("Email is required");
  }

  const user = await this.findOne({ email });

  if (!user) {
    throw Error("Invalid Email");
  }

  const token = Math.random().toString(36).slice(-8);

  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  return token;
};

userSchema.statics.signupClient = async function (email, clientId) {
  if (!email) {
    throw Error("Email is missing");
  }
  if (!validator.isEmail(email)) {
    throw Error("This is not a valid email");
  }

  const exists = await this.findOne({ email });

  if (exists) {
    throw Error("Email exists");
  }

  const user = await this.create({ _id: clientId, email, role: "client" });

  return user;
};

module.exports = mongoose.model("User", userSchema);
