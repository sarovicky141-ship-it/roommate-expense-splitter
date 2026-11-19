import Expense from '../models/Expense.js'
import Group from '../models/Group.js'

function isValidObjectId(id) {
  return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)
}

// GROUP BALANCE CALCULATION

async function calculateGroupBalances(group) {
  const balances = group.members.map((member) => ({
    memberId: member._id.toString(),
    name: member.name,
    totalPaidPaise: 0,
    totalSharePaise: 0,
    netBalancePaise: 0,
  }))
  const balancesByMemberId = new Map(
    balances.map((balance) => [balance.memberId, balance]),
  )
  const expenses = await Expense.find({ group: group._id })

  for (const expense of expenses) {
    if (!Number.isSafeInteger(expense.amountPaise) || expense.amountPaise <= 0) {
      throw new Error('Expense amount is not a valid positive integer in paise.')
    }

    const payer = balancesByMemberId.get(expense.paidBy.toString())
    if (!payer) {
      throw new Error('Expense payer is not a member of the group.')
    }

    payer.totalPaidPaise += expense.amountPaise
    if (!Number.isSafeInteger(payer.totalPaidPaise)) {
      throw new Error('Member paid total exceeds the safe integer range.')
    }

    if (expense.sharedAmong.length === 0) {
      throw new Error('Expense must include at least one sharing member.')
    }

    const baseSharePaise = Math.floor(expense.amountPaise / expense.sharedAmong.length)
    const remainderPaise = expense.amountPaise % expense.sharedAmong.length
    const seenMemberIds = new Set()

    // Assign leftover paise in the stored member order so every expense share
    // adds up exactly to the original integer-paise amount.
    for (let index = 0; index < expense.sharedAmong.length; index += 1) {
      const memberId = expense.sharedAmong[index].toString()
      const memberBalance = balancesByMemberId.get(memberId)

      if (!memberBalance || seenMemberIds.has(memberId)) {
        throw new Error('Expense sharing members are invalid for the group.')
      }

      seenMemberIds.add(memberId)
      memberBalance.totalSharePaise += baseSharePaise
      if (index < remainderPaise) {
        memberBalance.totalSharePaise += 1
      }

      if (!Number.isSafeInteger(memberBalance.totalSharePaise)) {
        throw new Error('Member share total exceeds the safe integer range.')
      }
    }
  }

  for (const balance of balances) {
    balance.netBalancePaise = balance.totalPaidPaise - balance.totalSharePaise
  }

  return balances
}

// BALANCE API
async function getGroupBalances(request, response) {
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

    return response.status(200).json({
      groupId: group._id.toString(),
      groupName: group.name,
      balances,
    })
  } catch (error) {
    console.error('Failed to calculate group balances:', error)
    return response.status(500).json({
      error: 'Unable to calculate group balances. Please try again.',
    })
  }
}

export { calculateGroupBalances, getGroupBalances }
