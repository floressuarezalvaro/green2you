const Invoice = require("../../models/invoiceModel");

describe("Invoice Model", () => {
  describe("Schema validation", () => {
    test("Creates invoice with all required fields", () => {
      const invoiceData = {
        clientId: "507f1f77bcf86cd799439011",
        date: new Date("2025-01-15"),
        amount: 150.75,
        user_id: "507f1f77bcf86cd799439012",
      };

      const invoice = new Invoice(invoiceData);
      const validationError = invoice.validateSync();

      expect(validationError).toBeUndefined();
      expect(invoice.clientId).toBe("507f1f77bcf86cd799439011");
      expect(invoice.date).toEqual(new Date("2025-01-15"));
      expect(invoice.amount).toBe(150.75);
      expect(invoice.user_id).toBe("507f1f77bcf86cd799439012");
    });

    test("Fails validation when clientId is missing", () => {
      const invoiceData = {
        date: new Date("2025-01-15"),
        amount: 150.75,
        user_id: "507f1f77bcf86cd799439012",
      };

      const invoice = new Invoice(invoiceData);
      const validationError = invoice.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.clientId).toBeDefined();
    });

    test("Fails validation when date is missing", () => {
      const invoiceData = {
        clientId: "507f1f77bcf86cd799439011",
        amount: 150.75,
        user_id: "507f1f77bcf86cd799439012",
      };

      const invoice = new Invoice(invoiceData);
      const validationError = invoice.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.date).toBeDefined();
    });

    test("Fails validation when amount is missing", () => {
      const invoiceData = {
        clientId: "507f1f77bcf86cd799439011",
        date: new Date("2025-01-15"),
        user_id: "507f1f77bcf86cd799439012",
      };

      const invoice = new Invoice(invoiceData);
      const validationError = invoice.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.amount).toBeDefined();
    });

    test("Fails validation when user_id is missing", () => {
      const invoiceData = {
        clientId: "507f1f77bcf86cd799439011",
        date: new Date("2025-01-15"),
        amount: 150.75,
      };

      const invoice = new Invoice(invoiceData);
      const validationError = invoice.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.user_id).toBeDefined();
    });

    test("Accepts optional description field", () => {
      const invoiceData = {
        clientId: "507f1f77bcf86cd799439011",
        date: new Date("2025-01-15"),
        amount: 150.75,
        description: "Monthly service fee",
        user_id: "507f1f77bcf86cd799439012",
      };

      const invoice = new Invoice(invoiceData);
      const validationError = invoice.validateSync();

      expect(validationError).toBeUndefined();
      expect(invoice.description).toBe("Monthly service fee");
    });

    test("Creates invoice without description field", () => {
      const invoiceData = {
        clientId: "507f1f77bcf86cd799439011",
        date: new Date("2025-01-15"),
        amount: 150.75,
        user_id: "507f1f77bcf86cd799439012",
      };

      const invoice = new Invoice(invoiceData);
      const validationError = invoice.validateSync();

      expect(validationError).toBeUndefined();
      expect(invoice.description).toBeUndefined();
    });

    test("Handles negative amounts", () => {
      const invoiceData = {
        clientId: "507f1f77bcf86cd799439011",
        date: new Date("2025-01-15"),
        amount: -50.0,
        user_id: "507f1f77bcf86cd799439012",
      };

      const invoice = new Invoice(invoiceData);
      const validationError = invoice.validateSync();

      expect(validationError).toBeUndefined();
      expect(invoice.amount).toBe(-50.0);
    });

    test("Handles zero amount", () => {
      const invoiceData = {
        clientId: "507f1f77bcf86cd799439011",
        date: new Date("2025-01-15"),
        amount: 0,
        user_id: "507f1f77bcf86cd799439012",
      };

      const invoice = new Invoice(invoiceData);
      const validationError = invoice.validateSync();

      expect(validationError).toBeUndefined();
      expect(invoice.amount).toBe(0);
    });

    test("Handles decimal amounts correctly", () => {
      const invoiceData = {
        clientId: "507f1f77bcf86cd799439011",
        date: new Date("2025-01-15"),
        amount: 99.99,
        user_id: "507f1f77bcf86cd799439012",
      };

      const invoice = new Invoice(invoiceData);
      const validationError = invoice.validateSync();

      expect(validationError).toBeUndefined();
      expect(invoice.amount).toBe(99.99);
    });
  });
});
