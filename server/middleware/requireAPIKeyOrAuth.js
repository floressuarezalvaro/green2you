const requireAuth = require("./requireAuth");

const requireAPIKeyOrAuth = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (apiKey && apiKey === process.env.API_KEY) {
    next();
  } else {
    requireAuth(req, res, next);
  }
};

module.exports = requireAPIKeyOrAuth;
