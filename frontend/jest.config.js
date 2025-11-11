module.exports = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/src/__mocks__/fileMock.js",
  },
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/index.js",
    "!src/reportWebVitals.js",
    "!src/**/*.test.{js,jsx}",
    "!src/**/*.spec.{js,jsx}",
    "!src/__mocks__/**",
  ],
  coverageDirectory: "coverage",
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx}",
    "<rootDir>/src/**/*.{spec,test}.{js,jsx}",
  ],
  transformIgnorePatterns: ["node_modules/(?!(axios)/)"],
  moduleDirectories: ["node_modules", "src"],
};
