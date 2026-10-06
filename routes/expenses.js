const express = require("express");
const router = express.Router();
const {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

// GET all expenses with optional month/year filter
router.get("/", getAllExpenses);

// POST create new expense or merge with existing
router.post("/", createExpense);

// PUT update expense by ID
router.put("/:id", updateExpense);

// DELETE expense or transaction by ID
router.delete("/:id", deleteExpense);

module.exports = router;
