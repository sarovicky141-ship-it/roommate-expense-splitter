import { sendRequest } from './api'

// Expense and selected-group dashboard API requests
function getGroupExpenses(groupId) {
  return sendRequest(`/groups/${groupId}/expenses`)
}

function createExpense(groupId, expense) {
  return sendRequest(`/groups/${groupId}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  })
}

function deleteExpense(groupId, expenseId) {
  return sendRequest(`/groups/${groupId}/expenses/${expenseId}`, {
    method: 'DELETE',
  })
}

function getGroupBalances(groupId) {
  return sendRequest(`/groups/${groupId}/balances`)
}

function getGroupSettlements(groupId) {
  return sendRequest(`/groups/${groupId}/settlements`)
}

export {
  createExpense,
  deleteExpense,
  getGroupBalances,
  getGroupExpenses,
  getGroupSettlements,
}
