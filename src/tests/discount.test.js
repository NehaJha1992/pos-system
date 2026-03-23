const { calculateDiscount, applyBulkDiscount } = require('../discount-service');

describe('Discount Service - QA Test Suite', () => {

  describe('calculateDiscount Function', () => {

    test('TEST-001: Should calculate 10% discount correctly', () => {
      const discount = calculateDiscount(100, 10);
      expect(discount).toBe(10);
    });

    test('TEST-002: Should calculate 20% discount correctly', () => {
      const discount = calculateDiscount(100, 20);
      expect(discount).toBe(20);
    });

    test('TEST-003: Should calculate 0% discount', () => {
      const discount = calculateDiscount(100, 0);
      expect(discount).toBe(0);
    });

    test('TEST-004: Should handle decimal amounts', () => {
      const discount = calculateDiscount(99.99, 10);
      expect(discount).toBeCloseTo(9.999, 2);
    });

    test('TEST-005: Should reject negative discount percent', () => {
      expect(() => calculateDiscount(100, -10)).toThrow('Discount percent must be between 0 and 100');
    });

    test('TEST-006: Should reject discount percent over 100', () => {
      expect(() => calculateDiscount(100, 150)).toThrow('Discount percent must be between 0 and 100');
    });
  });

  describe('applyBulkDiscount Function', () => {

    test('TEST-007: Should apply 10% bulk discount for purchases over $100', () => {
      const items = [
        { price: 50, quantity: 2 },    // $100
        { price: 10, quantity: 1 }     // +$10 = $110 total
      ];
      const result = applyBulkDiscount(items);
      expect(result.subtotal).toBe(110);
      expect(result.discountPercent).toBe(10);
      expect(result.discount).toBe(11);
      expect(result.total).toBe(99);
    });

    test('TEST-008: Should NOT apply discount for purchases under $100', () => {
      const items = [
        { price: 30, quantity: 2 }     // $60 total
      ];
      const result = applyBulkDiscount(items);
      expect(result.subtotal).toBe(60);
      expect(result.discountPercent).toBe(0);
      expect(result.discount).toBe(0);
      expect(result.total).toBe(60);
    });

    test('TEST-009: Should apply discount for exactly $100.01', () => {
      const items = [
        { price: 100.01, quantity: 1 }
      ];
      const result = applyBulkDiscount(items);
      expect(result.discountPercent).toBe(10);
    });

    test('TEST-010: Should handle empty items array', () => {
      const items = [];
      const result = applyBulkDiscount(items);
      expect(result.subtotal).toBe(0);
      expect(result.total).toBe(0);
    });

    test('TEST-011: Should calculate correct final total after discount', () => {
      const items = [
        { price: 50, quantity: 3 }     // $150 total
      ];
      const result = applyBulkDiscount(items);
      expect(result.total).toBe(135);  // 150 - (150 * 0.1)
    });
  });
});
