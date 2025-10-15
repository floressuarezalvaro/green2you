const dotenv = require("dotenv");

const ENV = process.env.NODE_ENV || "development";
const isProd = ENV === "production";
dotenv.config({ path: isProd ? ".env.production" : ".env.development" });

console.log(`You're in ${ENV} mode!`);

module.exports = { ENV, isProd };
