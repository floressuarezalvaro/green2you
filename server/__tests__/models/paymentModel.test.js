const mongoose = require("mongoose");
const Payment = require("../../models/paymentModel");

describe("Payment Model", () => {
  describe("Schema validation", () => {
    test("Creates payment with all required fields", () => {
      const paymentData = {
        clientId: "507f1f77bcf86cd799439011",
        statementId: "507f1f77bcf86cd799439012",
        type: "debit",
        amount: 100.5,
        checkDate: new Date("2025-01-15"),
        checkNumber: "1234",
        user_id: "507f1f77bcf86cd799439013",
      };

      const payment = new Payment(paymentData);
      const validationError = payment.validateSync();

      expect(validationError).toBeUndefined();
      expect(payment.clientId).toBe("507f1f77bcf86cd799439011");
      expect(payment.statementId).toBe("507f1f77bcf86cd799439012");
      expect(payment.type).toBe("debit");
      expect(payment.amount).toBe(100.5);
      expect(payment.checkDate).toEqual(new Date("2025-01-15"));
      expect(payment.checkNumber).toBe("1234");
      expect(payment.user_id).toBe("507f1f77bcf86cd799439013");
    });

    test("Accepts 'credit' as valid type", () => {
      const paymentData = {
        clientId: "507f1f77bcf86cd799439011",
        statementId: "507f1f77bcf86cd799439012",
        type: "credit",
        amount: 50.25,
        checkDate: new Date("2025-01-15"),
        checkNumber: "5678",
        user_id: "507f1f77bcf86cd799439013",
      };

      const payment = new Payment(paymentData);
      const validationError = payment.validateSync();

      expect(validationError).toBeUndefined();
      expect(payment.type).toBe("credit");
    });

    test("Fails validation when clientId is missing", () => {
      const paymentData = {
        statementId: "507f1f77bcf86cd799439012",
        type: "debit",
        amount: 100.5,
        checkDate: new Date("2025-01-15"),
        checkNumber: "1234",
        user_id: "507f1f77bcf86cd799439013",
      };

      const payment = new Payment(paymentData);
      const validationError = payment.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.clientId).toBeDefined();
    });

    test("Fails validation when statementId is missing", () => {
      const paymentData = {
        clientId: "507f1f77bcf86cd799439011",
        type: "debit",
        amount: 100.5,
        checkDate: new Date("2025-01-15"),
        checkNumber: "1234",
        user_id: "507f1f77bcf86cd799439013",
      };

      const payment = new Payment(paymentData);
      const validationError = payment.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.statementId).toBeDefined();
    });

    test("Fails validation when type is missing", () => {
      const paymentData = {
        clientId: "507f1f77bcf86cd799439011",
        statementId: "507f1f77bcf86cd799439012",
        amount: 100.5,
        checkDate: new Date("2025-01-15"),
        checkNumber: "1234",
        user_id: "507f1f77bcf86cd799439013",
      };

      const payment = new Payment(paymentData);
      const validationError = payment.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.type).toBeDefined();
    });

    test("Fails validation when type is not 'debit' or 'credit'", () => {
      const paymentData = {
        clientId: "507f1f77bcf86cd799439011",
        statementId: "507f1f77bcf86cd799439012",
        type: "invalid_type",
        amount: 100.5,
        checkDate: new Date("2025-01-15"),
        checkNumber: "1234",
        user_id: "507f1f77bcf86cd799439013",
      };

      const payment = new Payment(paymentData);
      const validationError = payment.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.type).toBeDefined();
      expect(validationError.errors.type.message).toContain(
        "is not a valid enum value"
      );
    });

    test("Fails validation when amount is missing", () => {
      const paymentData = {
        clientId: "507f1f77bcf86cd799439011",
        statementId: "507f1f77bcf86cd799439012",
        type: "debit",
        checkDate: new Date("2025-01-15"),
        checkNumber: "1234",
        user_id: "507f1f77bcf86cd799439013",
      };

      const payment = new Payment(paymentData);
      const validationError = payment.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.amount).toBeDefined();
    });

    test("Fails validation when checkDate is missing", () => {
      const paymentData = {
        clientId: "507f1f77bcf86cd799439011",
        statementId: "507f1f77bcf86cd799439012",
        type: "debit",
        amount: 100.5,
        checkNumber: "1234",
        user_id: "507f1f77bcf86cd799439013",
      };

      const payment = new Payment(paymentData);
      const validationError = payment.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.checkDate).toBeDefined();
    });

    test("Fails validation when checkNumber is missing", () => {
      const paymentData = {
        clientId: "507f1f77bcf86cd799439011",
        statementId: "507f1f77bcf86cd799439012",
        type: "debit",
        amount: 100.5,
        checkDate: new Date("2025-01-15"),
        user_id: "507f1f77bcf86cd799439013",
      };

      const payment = new Payment(paymentData);
      const validationError = payment.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.checkNumber).toBeDefined();
    });

    test("Fails validation when user_id is missing", () => {
      const paymentData = {
        clientId: "507f1f77bcf86cd799439011",
        statementId: "507f1f77bcf86cd799439012",
        type: "debit",
        amount: 100.5,
        checkDate: new Date("2025-01-15"),
        checkNumber: "1234",
      };

      const payment = new Payment(paymentData);
      const validationError = payment.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.user_id).toBeDefined();
    });

    test("Handles negative amounts", () => {
      const paymentData = {
        clientId: "507f1f77bcf86cd799439011",
        statementId: "507f1f77bcf86cd799439012",
        type: "credit",
        amount: -50.0,
        checkDate: new Date("2025-01-15"),
        checkNumber: "1234",
        user_id: "507f1f77bcf86cd799439013",
      };

      const payment = new Payment(paymentData);
      const validationError = payment.validateSync();

      expect(validationError).toBeUndefined();
      expect(payment.amount).toBe(-50.0);
    });

    test("Handles zero amount", () => {
      const paymentData = {
        clientId: "507f1f77bcf86cd799439011",
        statementId: "507f1f77bcf86cd799439012",
        type: "debit",
        amount: 0,
        checkDate: new Date("2025-01-15"),
        checkNumber: "1234",
        user_id: "507f1f77bcf86cd799439013",
      };

      const payment = new Payment(paymentData);
      const validationError = payment.validateSync();

      expect(validationError).toBeUndefined();
      expect(payment.amount).toBe(0);
    });

    test("Handles decimal amounts correctly", () => {
      const paymentData = {
        clientId: "507f1f77bcf86cd799439011",
        statementId: "507f1f77bcf86cd799439012",
        type: "debit",
        amount: 123.45,
        checkDate: new Date("2025-01-15"),
        checkNumber: "1234",
        user_id: "507f1f77bcf86cd799439013",
      };

      const payment = new Payment(paymentData);
      const validationError = payment.validateSync();

      expect(validationError).toBeUndefined();
      expect(payment.amount).toBe(123.45);
    });
  });
});
