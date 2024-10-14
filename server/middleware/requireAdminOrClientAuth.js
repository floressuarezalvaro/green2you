const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const requireAuth = (roles) => async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Authorization is Required" });
  }

  const token = authorization.split(" ")[1];

  try {
    const { _id } = jwt.verify(token, process.env.JWTSECRET);

    req.user = await User.findOne({ _id }).select("_id role");
    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }

    const rolesArray = Array.isArray(roles) ? roles : [roles];
    if (!rolesArray.includes(req.user.role)) {
      return res
        .status(401)
        .json({ error: "You do not have permission to perform this action." });
    }

    next();
  } catch (error) {
    res.status(401).json({ error: "Credentials timed out. Log in again." });
  }
};

const requireAdminAuth = requireAuth("admin");
const requireClientAuth = requireAuth(["admin", "client"]);

module.exports = { requireAdminAuth, requireClientAuth };
