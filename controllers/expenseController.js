const Expense = require("../models/Expense");
const {
  validateExpenseInput,
  validateUpdateInput,
} = require("../utils/validators");

/**
 * GET all expenses or filter by month/year
 */
const getAllExpenses = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    let expenses;
    if (month && year) {
      // Filter by month and year
      expenses = await Expense.find({
        date: { $regex: `^.+/${month}/${year}$` },
      });
    } else {
      // Get all expenses
      expenses = await Expense.find().lean();
    }

    res.json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST create or merge expense
 */
const createExpense = async (req, res, next) => {
  try {
    const { date, transactions, totalAmount } = req.body;

    // Validate input
    const validation = validateExpenseInput(req.body);
    if (!validation.isValid) {
      const err = new Error(validation.errors.join("; "));
      err.statusCode = 400;
      return next(err);
    }

    // Check if expense already exists for this date
    let existingExpense = await Expense.findOne({ date });

    if (existingExpense) {
      // Merge transactions
      existingExpense.transactions.push(...transactions);
      existingExpense.totalAmount = totalAmount;
      existingExpense.updatedAt = new Date();
      await existingExpense.save();

      return res.status(200).json({
        success: true,
        message: "Expense updated by merging transactions",
        data: existingExpense,
      });
    }

    // Create new expense
    const newExpense = new Expense({
      date,
      transactions,
      totalAmount,
    });

    await newExpense.save();

    res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: newExpense,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT update expense by ID
 */
const updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate update input
    const validation = validateUpdateInput(req.body);
    if (!validation.isValid) {
      const err = new Error(validation.errors.join("; "));
      err.statusCode = 400;
      return next(err);
    }

    const updateData = { ...req.body, updatedAt: new Date() };
    const updated = await Expense.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      const err = new Error("Expense not found");
      err.statusCode = 404;
      return next(err);
    }

    res.json({
      success: true,
      message: "Expense updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE expense or specific transaction within expense
 */
const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Try to delete as an expense document
    const deletedExpense = await Expense.findByIdAndDelete(id);

    if (deletedExpense) {
      return res.json({
        success: true,
        message: "Expense deleted successfully",
      });
    }

    // If not found as expense, try to delete as a transaction
    const expenseWithTransaction = await Expense.findOne({
      "transactions._id": id,
    });

    if (!expenseWithTransaction) {
      const err = new Error("Expense or transaction not found");
      err.statusCode = 404;
      return next(err);
    }

    // Remove transaction
    expenseWithTransaction.transactions =
      expenseWithTransaction.transactions.filter(
        (transaction) => transaction._id.toString() !== id,
      );

    // Recalculate total amount
    expenseWithTransaction.totalAmount =
      expenseWithTransaction.transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0,
      );

    expenseWithTransaction.updatedAt = new Date();
    await expenseWithTransaction.save();

    res.json({
      success: true,
      message: "Transaction deleted successfully",
      data: expenseWithTransaction,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};
