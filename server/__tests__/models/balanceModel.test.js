const mongoose = require("mongoose");
const Balance = require("../../models/balanceModel");

describe("Balance Model", () => {
  describe("Schema validation", () => {
    test("Creates balance with all required fields", () => {
      const balanceData = {
        currentBalance: 100.5,
        clientId: "507f1f77bcf86cd799439011",
      };

      const balance = new Balance(balanceData);
      const validationError = balance.validateSync();

      expect(validationError).toBeUndefined();
      expect(balance.currentBalance).toBe(100.5);
      expect(balance.clientId).toBe("507f1f77bcf86cd799439011");
    });

    test("Fails validation when currentBalance is missing", () => {
      const balanceData = {
        clientId: "507f1f77bcf86cd799439011",
      };

      const balance = new Balance(balanceData);
      const validationError = balance.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.currentBalance).toBeDefined();
    });

    test("Fails validation when clientId is missing", () => {
      const balanceData = {
        currentBalance: 100.5,
      };

      const balance = new Balance(balanceData);
      const validationError = balance.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.clientId).toBeDefined();
    });

    test("Accepts optional previousStatementBalance field", () => {
      const balanceData = {
        currentBalance: 100.5,
        clientId: "507f1f77bcf86cd799439011",
        previousStatementBalance: 50.25,
      };

      const balance = new Balance(balanceData);
      const validationError = balance.validateSync();

      expect(validationError).toBeUndefined();
      expect(balance.previousStatementBalance).toBe(50.25);
    });

    test("Accepts optional paymentsOrCredits field", () => {
      const balanceData = {
        currentBalance: 100.5,
        clientId: "507f1f77bcf86cd799439011",
        paymentsOrCredits: 25.0,
      };

      const balance = new Balance(balanceData);
      const validationError = balance.validateSync();

      expect(validationError).toBeUndefined();
      expect(balance.paymentsOrCredits).toBe(25.0);
    });

    test("Accepts optional serviceDues field", () => {
      const balanceData = {
        currentBalance: 100.5,
        clientId: "507f1f77bcf86cd799439011",
        serviceDues: 75.5,
      };

      const balance = new Balance(balanceData);
      const validationError = balance.validateSync();

      expect(validationError).toBeUndefined();
      expect(balance.serviceDues).toBe(75.5);
    });

    test("Accepts optional newStatementBalance field", () => {
      const balanceData = {
        currentBalance: 100.5,
        clientId: "507f1f77bcf86cd799439011",
        newStatementBalance: 200.75,
      };

      const balance = new Balance(balanceData);
      const validationError = balance.validateSync();

      expect(validationError).toBeUndefined();
      expect(balance.newStatementBalance).toBe(200.75);
    });

    test("Accepts optional pastDueAmount field", () => {
      const balanceData = {
        currentBalance: 100.5,
        clientId: "507f1f77bcf86cd799439011",
        pastDueAmount: 30.0,
      };

      const balance = new Balance(balanceData);
      const validationError = balance.validateSync();

      expect(validationError).toBeUndefined();
      expect(balance.pastDueAmount).toBe(30.0);
    });

    test("Creates balance with all fields populated", () => {
      const balanceData = {
        currentBalance: 100.5,
        previousStatementBalance: 50.25,
        paymentsOrCredits: 25.0,
        serviceDues: 75.5,
        newStatementBalance: 200.75,
        pastDueAmount: 30.0,
        clientId: "507f1f77bcf86cd799439011",
      };

      const balance = new Balance(balanceData);
      const validationError = balance.validateSync();

      expect(validationError).toBeUndefined();
      expect(balance.currentBalance).toBe(100.5);
      expect(balance.previousStatementBalance).toBe(50.25);
      expect(balance.paymentsOrCredits).toBe(25.0);
      expect(balance.serviceDues).toBe(75.5);
      expect(balance.newStatementBalance).toBe(200.75);
      expect(balance.pastDueAmount).toBe(30.0);
      expect(balance.clientId).toBe("507f1f77bcf86cd799439011");
    });

    test("Handles negative balance amounts", () => {
      const balanceData = {
        currentBalance: -50.0,
        clientId: "507f1f77bcf86cd799439011",
      };

      const balance = new Balance(balanceData);
      const validationError = balance.validateSync();

      expect(validationError).toBeUndefined();
      expect(balance.currentBalance).toBe(-50.0);
    });

    test("Handles zero balance", () => {
      const balanceData = {
        currentBalance: 0,
        clientId: "507f1f77bcf86cd799439011",
      };

      const balance = new Balance(balanceData);
      const validationError = balance.validateSync();

      expect(validationError).toBeUndefined();
      expect(balance.currentBalance).toBe(0);
    });
  });
});
