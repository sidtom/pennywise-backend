/**
 * Validate expense data
 */
const validateExpenseInput = (data) => {
  const errors = [];

  if (!data.date || typeof data.date !== 'string') {
    errors.push('Date is required and must be a string');
  }

  if (!Array.isArray(data.transactions) || data.transactions.length === 0) {
    errors.push('Transactions array is required and must not be empty');
  } else {
    data.transactions.forEach((transaction, index) => {
      if (!transaction.category || typeof transaction.category !== 'string') {
        errors.push(`Transaction ${index}: Category is required and must be a string`);
      }
      if (typeof transaction.amount !== 'number' || transaction.amount <= 0) {
        errors.push(`Transaction ${index}: Amount must be a positive number`);
      }
    });
  }

  if (typeof data.totalAmount !== 'number' || data.totalAmount < 0) {
    errors.push('Total amount must be a positive number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate update expense data (more lenient)
 */
const validateUpdateInput = (data) => {
  const errors = [];

  if (data.date !== undefined && typeof data.date !== 'string') {
    errors.push('Date must be a string');
  }

  if (data.transactions !== undefined) {
    if (!Array.isArray(data.transactions)) {
      errors.push('Transactions must be an array');
    } else {
      data.transactions.forEach((transaction, index) => {
        if (transaction.amount !== undefined && (typeof transaction.amount !== 'number' || transaction.amount < 0)) {
          errors.push(`Transaction ${index}: Amount must be a positive number`);
        }
      });
    }
  }

  if (data.totalAmount !== undefined && (typeof data.totalAmount !== 'number' || data.totalAmount < 0)) {
    errors.push('Total amount must be a positive number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateExpenseInput,
  validateUpdateInput,
};
