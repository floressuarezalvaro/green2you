const rateLimit = require("express-rate-limit");

const setLimit = (limit) => {
  return rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: limit || 50,
    message: {
      error: "Limit maxed out. Try again later.",
    },
    standardHeaders: false,
    legacyHeaders: false,
    ipv6Subnet: 56,
    skipSuccessfulRequests: true,
  });
};

module.exports = setLimit;
