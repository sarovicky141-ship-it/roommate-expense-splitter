import { useState } from 'react'
import ErrorMessage from '../common/ErrorMessage'
import { rupeesToPaise } from '../../utils/currency'
import './Expense.css'

// ==========================================
// EXPENSE FORM AND MEMBER SHARING
// ==========================================
function AddExpense({ group, onCreate }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState('')
  const [sharedAmong, setSharedAmong] = useState([])
  const [message, setMessage] = useState(null)

  // Toggle membership without mutating the current React state array.
  function toggleSharedMember(memberId) {
    setSharedAmong((currentMembers) =>
      currentMembers.includes(memberId)
        ? currentMembers.filter((id) => id !== memberId)
        : [...currentMembers, memberId],
    )
  }

  // Convert the entered rupees to integer paise before submitting the expense.
  async function handleSubmit(event) {
    event.preventDefault()
    setMessage(null)

    if (!description.trim()) {
      setMessage({ type: 'error', text: 'Enter an expense description.' })
      return
    }

    const amountPaise = rupeesToPaise(amount)
    if (amountPaise === null) {
      setMessage({
        type: 'error',
        text: 'Enter a valid amount greater than zero.',
      })
      return
    }

    if (!paidBy) {
      setMessage({ type: 'error', text: 'Select who paid for this expense.' })
      return
    }

    if (sharedAmong.length === 0) {
      setMessage({
        type: 'error',
        text: 'Select at least one sharing member.',
      })
      return
    }

    try {
      const result = await onCreate({
        description: description.trim(),
        amountPaise,
        paidBy,
        sharedAmong,
      })

      setDescription('')
      setAmount('')
      setPaidBy('')
      setSharedAmong([])
      setMessage({
        type: 'success',
        text: result.message || 'Expense created successfully.',
      })
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  return (
    <section className="panel" aria-labelledby="add-expense-heading">
      <div className="section-heading">
        <img
          className="step step-icon"
          src="/images/add-expense.png"
          alt=""
          aria-hidden="true"
        />
        <div>
          <h2 id="add-expense-heading">Add an expense</h2>
          <p>Adding to <strong>{group.name}</strong></p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="expense-description">Description</label>
        <input
          id="expense-description"
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="e.g. Groceries"
        />

        <label htmlFor="expense-amount">Amount (₹)</label>
        <input
          id="expense-amount"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="e.g. 900.00"
        />
        <p className="field-hint">Enter rupees with up to two decimal places.</p>

        <label htmlFor="expense-payer">Paid by</label>
        <select
          id="expense-payer"
          value={paidBy}
          onChange={(event) => setPaidBy(event.target.value)}
        >
          <option value="">Select a payer</option>
          {group.members.map((member) => (
            <option key={member._id} value={member._id}>{member.name}</option>
          ))}
        </select>

        <fieldset className="shared-members">
          <legend>Shared among</legend>
          <div className="checkbox-list">
            {group.members.map((member) => (
              <label className="checkbox-option" key={member._id}>
                <input
                  type="checkbox"
                  checked={sharedAmong.includes(member._id)}
                  onChange={() => toggleSharedMember(member._id)}
                />
                <span>{member.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="form-actions">
          <button className="button button-primary" type="submit">Add expense</button>
        </div>

        {message?.type === 'error' && <ErrorMessage message={message.text} />}
        {message?.type === 'success' && (
          <p className="message message-success" role="status">{message.text}</p>
        )}
      </form>
    </section>
  )
}

export default AddExpense
