import { useNavigate } from 'react-router-dom'
import AddExpense from '../components/Expense/AddExpense'
import ExpenseDashboard from '../components/Dashboard/ExpenseDashboard'
import EmptyState from '../components/common/EmptyState'
import ErrorMessage from '../components/common/ErrorMessage'
import Loading from '../components/common/Loading'
import './Pages.css'

// Show expense tools only after the saved selected group has been restored.
function ExpensesPage({ groupState, expenseState }) {
  const navigate = useNavigate()

  // Wait for group restoration before deciding whether to show the empty state.
  if (groupState.loadingGroups) {
    return (
      <div className="page-content">
        <Loading message="Loading your saved groups..." />
      </div>
    )
  }

  // An expense must always be associated with an existing group.
  if (!groupState.selectedGroup) {
    return (
      <div className="page-content">
        <section className="panel expenses-empty-state">
          <div className="page-intro">
            <p className="page-kicker">Expense workspace</p>
            <h1>Expenses</h1>
          </div>
          <EmptyState message="Select or create a group before managing expenses." />
          <button
            className="button button-primary"
            type="button"
            onClick={() => navigate('/groups')}
          >
            Go to Groups
          </button>
        </section>
      </div>
    )
  }

  const group = groupState.selectedGroup

  return (
    <div className="page-content">
      <div className="page-intro expense-page-intro">
        <div>
          <p className="page-kicker">Expense workspace</p>
          <h1>{group.name}</h1>
          <p>{group.members.length} group members</p>
        </div>
        <button
          className="button button-back-groups"
          type="button"
          onClick={() => navigate('/groups')}
        >
          <span className="back-button-arrow" aria-hidden="true">←</span>
          Back to Groups
        </button>
      </div>

      <ErrorMessage message={groupState.error} />
      <AddExpense
        key={group._id}
        group={group}
        onCreate={expenseState.addExpense}
      />
      <ExpenseDashboard
        group={group}
        expenses={expenseState.expenses}
        balances={expenseState.balances}
        settlements={expenseState.settlements}
        loading={expenseState.loading}
        error={expenseState.error}
        deletingExpenseId={expenseState.deletingExpenseId}
        onDelete={expenseState.deleteGroupExpense}
        onRefresh={expenseState.refreshDashboard}
      />
    </div>
  )
}

export default ExpensesPage
