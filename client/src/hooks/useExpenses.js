import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createExpense as saveExpense,
  deleteExpense as removeExpense,
  getGroupBalances,
  getGroupExpenses,
  getGroupSettlements,
} from '../services/expenseService'

// ==========================================
// SELECTED-GROUP EXPENSE DASHBOARD
// ==========================================
function useExpenses(groupId) {
  const [expenses, setExpenses] = useState([])
  const [balances, setBalances] = useState([])
  const [settlements, setSettlements] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deletingExpenseId, setDeletingExpenseId] = useState(null)
  const [loadedGroupId, setLoadedGroupId] = useState(null)
  const requestId = useRef(0)
  const activeGroupId = useRef(groupId)
  activeGroupId.current = groupId

  // Load all group-specific dashboard data together and discard stale responses.
  const refreshDashboard = useCallback(async () => {
    if (groupId !== activeGroupId.current) return

    const currentRequestId = ++requestId.current

    if (!groupId) {
      setExpenses([])
      setBalances([])
      setSettlements([])
      setLoadedGroupId(null)
      setLoading(false)
      setError('')
      return
    }

    setLoading(true)
    setError('')

    try {
      const [expenseResult, balanceResult, settlementResult] =
        await Promise.all([
          getGroupExpenses(groupId),
          getGroupBalances(groupId),
          getGroupSettlements(groupId),
        ])

      if (
        currentRequestId !== requestId.current ||
        groupId !== activeGroupId.current
      ) {
        return
      }

      setExpenses(expenseResult.expenses || [])
      setBalances(balanceResult.balances || [])
      setSettlements(settlementResult.settlements || [])
      setLoadedGroupId(groupId)
    } catch (requestError) {
      if (
        currentRequestId !== requestId.current ||
        groupId !== activeGroupId.current
      ) {
        return
      }

      setExpenses([])
      setBalances([])
      setSettlements([])
      setLoadedGroupId(groupId)
      setError(requestError.message)
    } finally {
      if (
        currentRequestId === requestId.current &&
        groupId === activeGroupId.current
      ) {
        setLoading(false)
      }
    }
  }, [groupId])

  useEffect(() => {
    refreshDashboard()
    return () => {
      requestId.current += 1
    }
  }, [refreshDashboard])

  // Keep the dashboard in sync after a successful create or delete request.
  async function addExpense(expenseDetails) {
    if (!groupId) {
      throw new Error('Select a group before adding an expense.')
    }

    const result = await saveExpense(groupId, expenseDetails)
    await refreshDashboard()
    return result
  }

  async function deleteGroupExpense(expenseId) {
    if (!groupId) return

    setDeletingExpenseId(expenseId)

    try {
      await removeExpense(groupId, expenseId)
      await refreshDashboard()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setDeletingExpenseId(null)
    }
  }

  // Avoid briefly showing another group's data while the new requests are pending.
  const hasCurrentGroupData = loadedGroupId === groupId

  return {
    expenses: hasCurrentGroupData ? expenses : [],
    balances: hasCurrentGroupData ? balances : [],
    settlements: hasCurrentGroupData ? settlements : [],
    loading: Boolean(groupId) && (!hasCurrentGroupData || loading),
    error,
    deletingExpenseId,
    addExpense,
    deleteGroupExpense,
    refreshDashboard,
  }
}

export default useExpenses
