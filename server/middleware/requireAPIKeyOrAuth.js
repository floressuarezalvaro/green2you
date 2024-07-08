const { requireClientAuth } = require("./requireAdminOrClientAuth");

const requireAPIKeyOrAuth = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (apiKey && apiKey === process.env.API_KEY) {
    next();
  } else {
    requireClientAuth(req, res, next);
  }
};

module.exports = requireAPIKeyOrAuth;
