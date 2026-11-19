import mongoose from 'mongoose'

// Store money as integer paise to avoid floating-point currency calculations.
const expenseSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  amountPaise: {
    type: Number,
    required: true,
    min: 1,
    validate: {
      validator: Number.isInteger,
      message: 'Amount must be a positive whole number of paise.',
    },
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  sharedAmong: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Expense = mongoose.model('Expense', expenseSchema)

export default Expense
