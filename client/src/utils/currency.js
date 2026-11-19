// RUPEE FORMATTING AND INPUT CONVERSION
function formatRupees(amountPaise) {
  return `₹${(amountPaise / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function rupeesToPaise(value) {
  const trimmedValue = value.trim()

  // Accept up to two decimal places and keep all stored money in integer paise.
  if (!/^\d+(\.\d{1,2})?$/.test(trimmedValue)) {
    return null
  }

  const [rupees, paise = ''] = trimmedValue.split('.')
  const amountPaise = Number(rupees) * 100 + Number(paise.padEnd(2, '0'))

  if (!Number.isSafeInteger(amountPaise) || amountPaise <= 0) {
    return null
  }

  return amountPaise
}

export { formatRupees, rupeesToPaise }
