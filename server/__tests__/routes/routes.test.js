jest.mock("../../controllers/balanceController");
jest.mock("../../controllers/clientController");
jest.mock("../../controllers/emailController");
jest.mock("../../controllers/invoiceController");
jest.mock("../../controllers/paymentsController");
jest.mock("../../controllers/statementsController");
jest.mock("../../controllers/userController");
jest.mock("../../middleware/requireAdminOrClientAuth");
jest.mock("../../middleware/requireAPIKeyOrAuth");
jest.mock("../../utils/PDFCreator");
jest.mock("../../utils/setLimit");

describe("Route Definitions", () => {
  describe("Balance Routes", () => {
    let router;

    beforeAll(() => {
      jest.spyOn(console, "log").mockImplementation(() => {});
      router = require("../../routes/balanceRoutes");
    });

    test("Exports an Express router", () => {
      expect(router).toBeDefined();
      expect(typeof router).toBe("function");
      expect(router.stack).toBeDefined();
    });

    test("Defines GET /client/:id route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route &&
          layer.route.path === "/client/:id" &&
          layer.route.methods.get
      );
      expect(route).toBeDefined();
    });

    test("Defines POST /:id route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route && layer.route.path === "/:id" && layer.route.methods.post
      );
      expect(route).toBeDefined();
    });

    test("Defines GET / route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route && layer.route.path === "/" && layer.route.methods.get
      );
      expect(route).toBeDefined();
    });

    test("Defines PUT /:id route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route && layer.route.path === "/:id" && layer.route.methods.put
      );
      expect(route).toBeDefined();
    });

    test("Defines DELETE /:id route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route &&
          layer.route.path === "/:id" &&
          layer.route.methods.delete
      );
      expect(route).toBeDefined();
    });
  });

  describe("Client Routes", () => {
    let router;

    beforeAll(() => {
      router = require("../../routes/clientRoutes");
    });

    test("Exports an Express router", () => {
      expect(router).toBeDefined();
      expect(typeof router).toBe("function");
      expect(router.stack).toBeDefined();
    });

    test("Defines GET /:id route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route && layer.route.path === "/:id" && layer.route.methods.get
      );
      expect(route).toBeDefined();
    });

    test("Defines GET / route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route && layer.route.path === "/" && layer.route.methods.get
      );
      expect(route).toBeDefined();
    });

    test("Defines POST / route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route && layer.route.path === "/" && layer.route.methods.post
      );
      expect(route).toBeDefined();
    });

    test("Defines DELETE /:id route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route &&
          layer.route.path === "/:id" &&
          layer.route.methods.delete
      );
      expect(route).toBeDefined();
    });

    test("Defines PUT /:id route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route && layer.route.path === "/:id" && layer.route.methods.put
      );
      expect(route).toBeDefined();
    });
  });

  describe("Email Routes", () => {
    let router;

    beforeAll(() => {
      router = require("../../routes/emailRoutes");
    });

    test("Exports an Express router", () => {
      expect(router).toBeDefined();
      expect(typeof router).toBe("function");
      expect(router.stack).toBeDefined();
    });

    test("Defines GET / route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route && layer.route.path === "/" && layer.route.methods.get
      );
      expect(route).toBeDefined();
    });

    test("Defines POST /manual-statement-email route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route &&
          layer.route.path === "/manual-statement-email" &&
          layer.route.methods.post
      );
      expect(route).toBeDefined();
    });
  });

  describe("Invoice Routes", () => {
    let router;

    beforeAll(() => {
      router = require("../../routes/invoiceRoutes");
    });

    test("Exports an Express router", () => {
      expect(router).toBeDefined();
      expect(typeof router).toBe("function");
      expect(router.stack).toBeDefined();
    });

    test("Defines GET /client/:id route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route &&
          layer.route.path === "/client/:id" &&
          layer.route.methods.get
      );
      expect(route).toBeDefined();
    });

    test("Defines GET / route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route && layer.route.path === "/" && layer.route.methods.get
      );
      expect(route).toBeDefined();
    });

    test("Defines GET /:id route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route && layer.route.path === "/:id" && layer.route.methods.get
      );
      expect(route).toBeDefined();
    });

    test("Defines POST / route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route && layer.route.path === "/" && layer.route.methods.post
      );
      expect(route).toBeDefined();
    });

    test("Defines DELETE /:id route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route &&
          layer.route.path === "/:id" &&
          layer.route.methods.delete
      );
      expect(route).toBeDefined();
    });

    test("Defines PUT /:id route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route && layer.route.path === "/:id" && layer.route.methods.put
      );
      expect(route).toBeDefined();
    });
  });

  describe("Payment Routes", () => {
    let router;

    beforeAll(() => {
      router = require("../../routes/paymentRoutes");
    });

    test("Exports an Express router", () => {
      expect(router).toBeDefined();
      expect(typeof router).toBe("function");
      expect(router.stack).toBeDefined();
    });

    test("Defines GET /client/:clientId route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route &&
          layer.route.path === "/client/:clientId" &&
          layer.route.methods.get
      );
      expect(route).toBeDefined();
    });

    test("Defines POST / route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route && layer.route.path === "/" && layer.route.methods.post
      );
      expect(route).toBeDefined();
    });

    test("Defines GET / route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route && layer.route.path === "/" && layer.route.methods.get
      );
      expect(route).toBeDefined();
    });

    test("Defines GET /:id route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route && layer.route.path === "/:id" && layer.route.methods.get
      );
      expect(route).toBeDefined();
    });

    test("Defines PUT /:id route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route && layer.route.path === "/:id" && layer.route.methods.put
      );
      expect(route).toBeDefined();
    });

    test("Defines DELETE /:id route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route &&
          layer.route.path === "/:id" &&
          layer.route.methods.delete
      );
      expect(route).toBeDefined();
    });
  });

  describe("Statements Routes", () => {
    let router;

    beforeAll(() => {
      router = require("../../routes/statementsRoutes");
    });

    test("Exports an Express router", () => {
      expect(router).toBeDefined();
      expect(typeof router).toBe("function");
      expect(router.stack).toBeDefined();
    });

    test("Defines GET /print/:id route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route &&
          layer.route.path === "/print/:id" &&
          layer.route.methods.get
      );
      expect(route).toBeDefined();
    });

    test("Defines POST / route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route && layer.route.path === "/" && layer.route.methods.post
      );
      expect(route).toBeDefined();
    });

    test("Defines GET /client/:clientId route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route &&
          layer.route.path === "/client/:clientId" &&
          layer.route.methods.get
      );
      expect(route).toBeDefined();
    });

    test("Defines GET / route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route && layer.route.path === "/" && layer.route.methods.get
      );
      expect(route).toBeDefined();
    });

    test("Defines GET /:id route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route && layer.route.path === "/:id" && layer.route.methods.get
      );
      expect(route).toBeDefined();
    });

    test("Defines DELETE /:id route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route &&
          layer.route.path === "/:id" &&
          layer.route.methods.delete
      );
      expect(route).toBeDefined();
    });

    test("Defines PUT /:id route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route && layer.route.path === "/:id" && layer.route.methods.put
      );
      expect(route).toBeDefined();
    });
  });

  describe("User Routes", () => {
    let router;

    beforeAll(() => {
      router = require("../../routes/userRoutes");
    });

    test("Exports an Express router", () => {
      expect(router).toBeDefined();
      expect(typeof router).toBe("function");
      expect(router.stack).toBeDefined();
    });

    test("Defines POST /login route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route &&
          layer.route.path === "/login" &&
          layer.route.methods.post
      );
      expect(route).toBeDefined();
    });

    test("Defines POST /forgotpassword route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route &&
          layer.route.path === "/forgotpassword" &&
          layer.route.methods.post
      );
      expect(route).toBeDefined();
    });

    test("Defines POST /resetpassword/:token route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route &&
          layer.route.path === "/resetpassword/:token" &&
          layer.route.methods.post
      );
      expect(route).toBeDefined();
    });

    test("Defines POST /resetpassword route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route &&
          layer.route.path === "/resetpassword" &&
          layer.route.methods.post
      );
      expect(route).toBeDefined();
    });

    test("Defines POST /signup route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route &&
          layer.route.path === "/signup" &&
          layer.route.methods.post
      );
      expect(route).toBeDefined();
    });

    test("Defines POST /signup-client route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route &&
          layer.route.path === "/signup-client" &&
          layer.route.methods.post
      );
      expect(route).toBeDefined();
    });

    test("Defines GET / route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route && layer.route.path === "/" && layer.route.methods.get
      );
      expect(route).toBeDefined();
    });

    test("Defines GET /:id route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route && layer.route.path === "/:id" && layer.route.methods.get
      );
      expect(route).toBeDefined();
    });

    test("Defines DELETE /:id route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route &&
          layer.route.path === "/:id" &&
          layer.route.methods.delete
      );
      expect(route).toBeDefined();
    });

    test("Defines PUT /:id route", () => {
      const route = router.stack.find(
        (layer) =>
          layer.route && layer.route.path === "/:id" && layer.route.methods.put
      );
      expect(route).toBeDefined();
    });
  });

  describe("Routes Index", () => {
    let router;

    beforeAll(() => {
      const setLimit = require("../../utils/setLimit");
      setLimit.mockReturnValue((req, res, next) => next());

      router = require("../../routes/index");
    });

    test("Exports an Express router", () => {
      expect(router).toBeDefined();
      expect(typeof router).toBe("function");
      expect(router.stack).toBeDefined();
    });

    test("Has middleware and subroute layers", () => {
      expect(router.stack.length).toBeGreaterThan(0);
    });
  });
});
