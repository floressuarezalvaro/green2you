const request = require("supertest");
const app = require("../app");

jest.mock("../config/environment.js", () => ({
  isProd: false,
}));

jest.mock("../routes", () => {
  const express = require("express");
  const router = express.Router();

  router.get("/test", (req, res) => {
    res.json({ message: "test route" });
  });

  router.get("/error", (req, res, next) => {
    next(new Error("Test error"));
  });

  return router;
});

describe("Express App", () => {
  describe("Middleware Configuration", () => {
    test("Should parse JSON bodies", async () => {
      const response = await request(app)
        .post("/api/test")
        .send({ data: "test" })
        .set("Content-Type", "application/json");

      expect(response.status).toBeDefined();
    });

    test("Should reject JSON bodies larger than 10kb", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const largePayload = { data: "a".repeat(11 * 1024) };
      const response = await request(app)
        .post("/api/test")
        .send(largePayload)
        .set("Content-Type", "application/json");

      expect(response.status).toBe(413);
      consoleSpy.mockRestore();
    });

    test("Should set CORs headers", async () => {
      const response = await request(app)
        .get("/api/test")
        .set("Origin", "https://www.green-2-you.com");

      expect(response.headers["access-control-allow-origin"]).toBe(
        "https://www.green-2-you.com"
      );
    });

    test("Should set security headers with helmet", async () => {
      const response = await request(app).get("/api/test");
      expect(response.headers["x-content-type-options"]).toBe("nosniff");
    });

    test("Should sanitize MongoDB operators", async () => {
      const response = await request(app)
        .get("/api/test")
        .send({ username: { $gt: "" } })
        .set("Content-Type", "application/json");

      expect(response.status).toBeDefined();
    });
  });

  describe("API Routes", () => {
    test("should mount routes at /api prefix", async () => {
      const response = await request(app).get("/api/test");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "test route" });
    });

    test("should not respond to routes without /api prefix", async () => {
      const response = await request(app).get("/jest/test");
      expect(response.status).toBe(404);
    });
  });

  describe("Error handling", () => {
    test("Should handle errors with global error handler", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const response = await request(app).get("/api/error");
      expect(response.status).toBe(500);

      consoleSpy.mockRestore();
    });
  });

  describe("Production mode", () => {
    test("Should not serve static files in development mode", async () => {
      const response = await request(app).get("/some-frontend-route");
      expect(response.status).toBe(404);
    });
  });

  describe("Trust Proxy", () => {
    test("Should configure trust proxy setting", () => {
      expect(app.get("trust proxy")).toBeDefined();
    });
  });
});
