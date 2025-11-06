const express = require("express");
const request = require("supertest");

describe("Version Routes", () => {
  let app;

  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});

    app = express();
    app.use(express.json());
    app.use("/api/version", require("../../routes/versionRoutes"));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("GET /api/version", () => {
    test("Returns version information", async () => {
      const response = await request(app).get("/api/version");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("backend");
      expect(response.body).toHaveProperty("frontend");
      expect(response.body).toHaveProperty("environment");
    });

    test("Returns backend version from package.json", async () => {
      const response = await request(app).get("/api/version");
      const packageJson = require("../../package.json");

      expect(response.body.backend).toBe(packageJson.version);
    });

    test("Returns frontend version from frontend package.json", async () => {
      const response = await request(app).get("/api/version");
      const frontendPackageJson = require("../../../frontend/package.json");

      expect(response.body.frontend).toBe(frontendPackageJson.version);
    });

    test("Returns environment from ENV config", async () => {
      const response = await request(app).get("/api/version");

      expect(response.body.environment).toBeDefined();
    });

    test("Response is JSON format", async () => {
      const response = await request(app).get("/api/version");

      expect(response.headers["content-type"]).toMatch(/json/);
    });
  });
});
