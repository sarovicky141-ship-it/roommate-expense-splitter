import EmptyState from '../common/EmptyState'
import ExpenseItem from './ExpenseItem'
import './Expense.css'

// Display the selected group's expense records or an empty state.
function ExpenseList({ expenses, deletingExpenseId, onDelete }) {
  if (expenses.length === 0) {
    return <EmptyState message="No expenses recorded yet." />
  }

  return (
    <div className="expense-list">
      {expenses.map((expense) => (
        <ExpenseItem
          key={expense.expenseId}
          expense={expense}
          deleting={deletingExpenseId === expense.expenseId}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default ExpenseList
