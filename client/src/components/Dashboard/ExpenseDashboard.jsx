import { useEffect, useState } from 'react'
import EmptyState from '../common/EmptyState'
import ErrorMessage from '../common/ErrorMessage'
import Loading from '../common/Loading'
import ExpenseList from '../Expense/ExpenseList'
import { formatRupees } from '../../utils/currency'
import {
  buildExpenseCsv,
  createExpenseCsvFilename,
} from '../../utils/expenseCsv'
import BalanceSummary from './BalanceSummary'
import SettlementList from './SettlementList'
import './Dashboard.css'

// GROUP EXPENSE DASHBOARD AND CSV EXPORT
function ExpenseDashboard({
  group,
  expenses,
  balances,
  settlements,
  loading,
  error,
  deletingExpenseId,
  onDelete,
  onRefresh,
}) {
  const [exportMessage, setExportMessage] = useState(null)
  const totalAmountPaise = expenses.reduce(
    (total, expense) => total + expense.amountPaise,
    0,
  )

  useEffect(() => {
    setExportMessage(null)
  }, [group._id])

  // Build a UTF-8 CSV download from the selected group's current API data.
  function handleExportCsv() {
    setExportMessage(null)

    if (!group?._id || typeof group.name !== 'string' || !group.name.trim()) {
      setExportMessage({
        type: 'error',
        text: 'Group information is unavailable. Select a group and try again.',
      })
      return
    }

    if (!Array.isArray(expenses)) {
      setExportMessage({
        type: 'error',
        text: 'Expense data is unavailable. Refresh the dashboard and try again.',
      })
      return
    }

    if (expenses.length === 0) {
      setExportMessage({
        type: 'info',
        text: 'There are no expenses in this group to export yet.',
      })
      return
    }

    let downloadUrl
    let downloadLink

    try {
      const csv = buildExpenseCsv(expenses, balances)
      // The BOM helps spreadsheet applications recognize UTF-8 currency and names.
      const file = new Blob([`\uFEFF${csv}`], {
        type: 'text/csv;charset=utf-8',
      })
      downloadUrl = window.URL.createObjectURL(file)
      downloadLink = document.createElement('a')
      downloadLink.href = downloadUrl
      downloadLink.download = createExpenseCsvFilename(group.name)
      downloadLink.style.display = 'none'
      document.body.appendChild(downloadLink)
      downloadLink.click()

      setExportMessage({
        type: 'success',
        text: `Exported ${expenses.length} expense${expenses.length === 1 ? '' : 's'} as CSV.`,
      })
    } catch (exportError) {
      console.error('Failed to export expenses as CSV:', exportError)
      setExportMessage({
        type: 'error',
        text: 'Could not download the CSV. Please try again.',
      })
    } finally {
      downloadLink?.remove()
      if (downloadUrl) {
        window.setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 1000)
      }
    }
  }

  function handleRefreshDashboard() {
    setExportMessage(null)
    onRefresh()
  }

  return (
    <section className="panel dashboard-panel" aria-labelledby="dashboard-heading">
      <div className="section-heading">
        <img
          className="step step-icon"
          src="/images/expense-calculator.png"
          alt=""
          aria-hidden="true"
        />
        <div>
          <h2 id="dashboard-heading">{group.name} Expense Dashboard</h2>
          <p>Expense history, balances, and settlement suggestions.</p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loading message="Loading dashboard..." />
      ) : (
        <>
          <div className="expense-summary">
            <div>
              <span>Total expenses</span>
              <strong>{formatRupees(totalAmountPaise)}</strong>
            </div>
            <div>
              <span>Recorded expenses</span>
              <strong>{expenses.length}</strong>
            </div>
          </div>

          <section className="dashboard-section" aria-labelledby="expense-history-heading">
            <h3 id="expense-history-heading">Expense History</h3>
            {expenses.length === 0 ? (
              <EmptyState message="No expenses recorded yet." />
            ) : (
              <ExpenseList
                expenses={expenses}
                deletingExpenseId={deletingExpenseId}
                onDelete={onDelete}
              />
            )}
          </section>

          <BalanceSummary
            balances={balances}
            onExportCsv={handleExportCsv}
            exportDisabled={loading || Boolean(error)}
            exportMessage={exportMessage}
          />
          <SettlementList settlements={settlements} />

        </>
      )}

      <button
        className="button button-secondary refresh-button"
        type="button"
        onClick={handleRefreshDashboard}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? 'Refreshing dashboard...' : 'Refresh Dashboard'}
      </button>
    </section>
  )
}

export default ExpenseDashboard
