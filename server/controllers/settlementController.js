import Group from '../models/Group.js'
import { calculateGroupBalances } from './balanceController.js'

function isValidObjectId(id) {
  return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)
}

// ==========================================
// SETTLEMENT SUGGESTIONS
// ==========================================
async function getGroupSettlements(request, response) {
  const { groupId } = request.params

  if (!isValidObjectId(groupId)) {
    return response.status(400).json({ error: 'A valid group ID is required.' })
  }

  try {
    const group = await Group.findById(groupId)

    if (!group) {
      return response.status(404).json({ error: 'Group not found.' })
    }

    const balances = await calculateGroupBalances(group)
    const creditors = balances
      .filter((balance) => balance.netBalancePaise > 0)
      .map((balance) => ({
        memberId: balance.memberId,
        name: balance.name,
        amountPaise: balance.netBalancePaise,
      }))
    const debtors = balances
      .filter((balance) => balance.netBalancePaise < 0)
      .map((balance) => ({
        memberId: balance.memberId,
        name: balance.name,
        amountPaise: Math.abs(balance.netBalancePaise),
      }))
    const settlements = []
    let debtorIndex = 0
    let creditorIndex = 0

    // Match each debtor with a creditor for the smaller outstanding balance,
    // then continue until one side is settled.
    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex]
      const creditor = creditors[creditorIndex]
      const amountPaise = Math.min(debtor.amountPaise, creditor.amountPaise)

      settlements.push({
        from: { memberId: debtor.memberId, name: debtor.name },
        to: { memberId: creditor.memberId, name: creditor.name },
        amountPaise,
      })

      debtor.amountPaise -= amountPaise
      creditor.amountPaise -= amountPaise

      if (debtor.amountPaise === 0) {
        debtorIndex += 1
      }

      if (creditor.amountPaise === 0) {
        creditorIndex += 1
      }
    }

    return response.status(200).json({
      groupId: group._id.toString(),
      groupName: group.name,
      settlements,
    })
  } catch (error) {
    console.error('Failed to calculate group settlements:', error)
    return response.status(500).json({
      error: 'Unable to calculate group settlements. Please try again.',
    })
  }
}

export { getGroupSettlements }
