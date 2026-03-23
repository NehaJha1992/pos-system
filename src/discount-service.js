/**
 * Discount Service - New Feature
 * Calculates discounts based on different rules
 */

const calculateDiscount = (total, discountPercent) => {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error('Discount percent must be between 0 and 100');
  }
  return total * (discountPercent / 100);
};

const applyBulkDiscount = (items) => {
  let subtotal = 0;
  items.forEach(item => {
    subtotal += item.price * item.quantity;
  });

  // 10% discount if purchase > $100
  if (subtotal > 100) {
    return {
      subtotal,
      discountPercent: 10,
      discount: subtotal * 0.1,
      total: subtotal * 0.9
    };
  }

  return {
    subtotal,
    discountPercent: 0,
    discount: 0,
    total: subtotal
  };
};

module.exports = {
  calculateDiscount,
  applyBulkDiscount
};
