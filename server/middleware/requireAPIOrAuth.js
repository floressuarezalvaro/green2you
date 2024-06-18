const requireAuth = require("../middleware/requireAuth");

const requireAPIOrAuth = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (apiKey && apiKey === process.env.API_KEY) {
    // API key is valid
    next();
  } else {
    // Fallback to requireAuth middleware
    requireAuth(req, res, next);
  }
};

module.exports = requireAPIOrAuth;
