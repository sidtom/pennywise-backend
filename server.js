const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/PennywiseDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Corrected schema based on MongoDB Compass structure
const ExpenseSchema = new mongoose.Schema({
  date: String,
  transactions: [
    {
      category: String,
      amount: Number,
      transactionType: String,
      transactionNature: String,
    },
  ],
  totalAmount: Number,
});

const Expense = mongoose.model('Expense', ExpenseSchema);

// Reusable function to fetch all expenses
async function fetchAllExpenses() {
  try {
    const expenses = await Expense.find();
    return expenses;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
}

// GET endpoint using the reusable function
app.get('/expenses', async (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (month && year) {
      const expenses = await Expense.find({
        date: { $regex: `^.+/${month}/${year}$` }
      });
      return res.json(expenses);
    }
    
    const expenses = await fetchAllExpenses();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
});

app.post('/expenses', async (req, res) => {
  const { date, transactions, totalAmount } = req.body;

  try {
    // Check if a document already exists for the given date
    let existingExpense = await Expense.findOne({ date });

    if (existingExpense) {
      // Merge transactions and update totalAmount
      existingExpense.transactions.push(...transactions);
      existingExpense.totalAmount = totalAmount;
      await existingExpense.save();
      res.json(existingExpense);
    } else {
      // Create a new document
      const newExpense = new Expense({
        date,
        transactions,
        totalAmount
      });
      await newExpense.save();
      res.json(newExpense);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error saving expense', error });
  }
});


// PUT endpoint
app.put('/expenses/:id', async (req, res) => {
  const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE endpoint - handles both expense and transaction deletion
app.delete('/expenses/:id', async (req, res) => {
  try {
    // First try to delete as an expense document
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);
    
    if (deletedExpense) {
      return res.json({ message: 'Expense deleted' });
    }
    
    // If not found as expense, try to find and remove as transaction
    const expenseWithTransaction = await Expense.findOne({
      'transactions._id': req.params.id
    });
    
    if (expenseWithTransaction) {
      expenseWithTransaction.transactions = expenseWithTransaction.transactions.filter(
        transaction => transaction._id.toString() !== req.params.id
      );
      
      // Recalculate total amount
      expenseWithTransaction.totalAmount = expenseWithTransaction.transactions.reduce(
        (sum, transaction) => sum + transaction.amount, 0
      );
      
      await expenseWithTransaction.save();
      return res.json({ message: 'Transaction deleted' });
    }
    
    res.status(404).json({ message: 'Expense or transaction not found' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting', error });
  }
});

// Server start
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
