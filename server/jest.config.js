module.exports = {
  clearMocks: true,
  testEnvironment: "node",
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "**/*.js",
    "!**/node_modules/**",
    "!**/coverage/**",
    "!jest.config.js",
    "!utils/herokuScript.js",
    "!utils/PDFCreator.js",
    "!utils/statementScheduler.js",
  ],
  testMatch: ["**/__tests__/**/*.js", "**/*.test.js", "**/*.spec.js"],
  testTimeout: 10000,
};
