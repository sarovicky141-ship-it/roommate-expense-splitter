import { Router } from 'express'
import { getGroupBalances } from '../controllers/balanceController.js'
import { createExpense, deleteExpense, getGroupExpenses } from '../controllers/expenseController.js'
import {
  createGroup,
  deleteGroup,
  getGroupById,
  getGroups,
} from '../controllers/groupController.js'
import { getGroupSettlements } from '../controllers/settlementController.js'

const router = Router()

// Group list and detail routes
router.get('/', getGroups)
router.get('/:groupId', getGroupById)
router.delete('/:groupId', deleteGroup)

// Create a group with its initial member list
router.post('/', createGroup)

// Group-scoped expense, balance, and settlement routes
router.get('/:groupId/expenses', getGroupExpenses)
router.get('/:groupId/balances', getGroupBalances)
router.get('/:groupId/settlements', getGroupSettlements)
router.post('/:groupId/expenses', createExpense)
router.delete('/:groupId/expenses/:expenseId', deleteExpense)

export default router
