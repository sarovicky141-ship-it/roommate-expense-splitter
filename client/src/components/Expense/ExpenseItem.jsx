import { formatRupees } from '../../utils/currency'
import './Expense.css'

// Present one expense and confirm before requesting its deletion.
function ExpenseItem({ expense, deleting, onDelete }) {
  function handleDelete() {
    const confirmed = window.confirm('Are you sure you want to delete this expense?')
    if (confirmed) onDelete(expense.expenseId)
  }

  return (
    <article className="expense-item">
      <div className="expense-info">
        <h4>{expense.description}</h4>
        <p>Paid by {expense.paidBy.name}</p>
        <p>
          Shared among: {expense.sharedAmong.map((member) => member.name).join(', ')}
        </p>
        <small>{new Date(expense.createdAt).toLocaleDateString('en-IN')}</small>
      </div>
      <div className="expense-actions">
        <strong>{formatRupees(expense.amountPaise)}</strong>
        <button
          className="button button-remove"
          type="button"
          disabled={deleting}
          onClick={handleDelete}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </article>
  )
}

export default ExpenseItem
