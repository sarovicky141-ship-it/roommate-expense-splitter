import { formatRupees } from './currency'

// ==========================================
// CSV VALUE AND DISPLAY HELPERS
// ==========================================
function escapeCsvValue(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

function getMemberName(member) {
  if (typeof member?.name === 'string' && member.name.trim()) {
    return member.name.trim()
  }

  return 'Unknown member'
}

function formatExpenseDate(createdAt) {
  if (!createdAt) return ''

  const date = new Date(createdAt)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-IN')
}

function formatBalance(amountPaise) {
  const sign = amountPaise > 0 ? '+' : amountPaise < 0 ? '-' : ''
  return `${sign}${formatRupees(Math.abs(amountPaise))}`
}

// ==========================================
// EXPENSE AND BALANCE REPORT ROWS
// ==========================================
function buildExpenseCsv(expenses, balances) {
  if (!Array.isArray(expenses)) {
    throw new Error('Expense data is unavailable.')
  }

  if (!Array.isArray(balances)) {
    throw new Error('Balance data is unavailable.')
  }

  // Expense and balance data are already scoped to the currently selected group.
  const expenseRows = expenses.map((expense) => {
    if (
      typeof expense?.description !== 'string' ||
      !Number.isSafeInteger(expense.amountPaise) ||
      expense.amountPaise <= 0 ||
      !Array.isArray(expense.sharedAmong) ||
      expense.sharedAmong.length === 0
    ) {
      throw new Error('An expense record contains invalid data.')
    }

    return [
      expense.description,
      formatRupees(expense.amountPaise),
      getMemberName(expense.paidBy),
      `${expense.sharedAmong.length} member${expense.sharedAmong.length === 1 ? '' : 's'}`,
      formatExpenseDate(expense.createdAt),
    ]
  })

  const balanceRows = balances.map((balance) => {
    if (
      !Number.isSafeInteger(balance?.totalPaidPaise) ||
      !Number.isSafeInteger(balance?.totalSharePaise) ||
      !Number.isSafeInteger(balance?.netBalancePaise)
    ) {
      throw new Error('A balance record contains invalid data.')
    }

    const status =
      balance.netBalancePaise > 0
        ? 'Should Receive'
        : balance.netBalancePaise < 0
          ? 'Should Pay'
          : 'Settled'

    return [
      getMemberName(balance),
      formatRupees(balance.totalPaidPaise),
      formatRupees(balance.totalSharePaise),
      formatBalance(balance.netBalancePaise),
      status,
    ]
  })

  // Keep the two requested report sections in a predictable order.
  const rows = [
    ['Expense Details'],
    ['Description', 'Total Amount', 'Paid By', 'Shared Members', 'Date'],
    ...expenseRows,
    [],
    ['Individual Balance Details'],
    ['Member', 'Total Paid', 'Total Share', 'Net Balance', 'Status'],
    ...balanceRows,
  ]

  return rows
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\r\n')
}

// Use a readable, filesystem-safe group name in the downloaded filename.
function createExpenseCsvFilename(groupName) {
  const groupSlug =
    typeof groupName === 'string'
      ? groupName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      : ''

  return `roommate-expenses-${groupSlug || 'group'}.csv`
}

export { buildExpenseCsv, createExpenseCsvFilename }
