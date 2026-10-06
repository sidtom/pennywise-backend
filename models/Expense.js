const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  transactionType: String,
  transactionNature: String,
});

const ExpenseSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    index: true,
  },
  transactions: [TransactionSchema],
  totalAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient date queries
ExpenseSchema.index({ date: 1 });

const Expense = mongoose.model("Expense", ExpenseSchema);

module.exports = Expense;
