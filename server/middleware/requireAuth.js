const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const requireAuth = async (req, res, next) => {
  // verify auth
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Authorization Required" });
  }

  const token = authorization.split(" ")[1];

  try {
    const { _id } = jwt.verify(token, process.env.JWTSECRET);

    // finds user and attaches to request
    req.user = await User.findOne({ _id }).select("_id");
    next();
  } catch (error) {
    res.status(401).json({ error: "Credentials timed out. Log in again." });
  }
};

module.exports = requireAuth;
