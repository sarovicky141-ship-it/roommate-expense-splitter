import Expense from '../models/Expense.js'
import Group from '../models/Group.js'

// Validate route and member IDs before database lookup or persistence.
function isValidObjectId(id) {
  return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)
}

// EXPENSE CREATION
async function createExpense(request, response) {
  const { groupId } = request.params
  const { description, amountPaise, paidBy, sharedAmong } = request.body || {}

  if (!isValidObjectId(groupId)) {
    return response.status(400).json({ error: 'A valid group ID is required.' })
  }

  if (typeof description !== 'string' || description.trim() === '') {
    return response.status(400).json({ error: 'Description is required.' })
  }

  if (!Number.isInteger(amountPaise) || amountPaise <= 0) {
    return response.status(400).json({ error: 'Amount must be a positive whole number of paise.' })
  }

  if (!isValidObjectId(paidBy)) {
    return response.status(400).json({ error: 'A valid payer member ID is required.' })
  }

  if (!Array.isArray(sharedAmong) || sharedAmong.length === 0) {
    return response.status(400).json({ error: 'At least one sharing member is required.' })
  }

  for (const memberId of sharedAmong) {
    if (!isValidObjectId(memberId)) {
      return response.status(400).json({ error: 'Every sharing member must have a valid member ID.' })
    }
  }

  const sharedMemberIds = sharedAmong.map((memberId) => memberId.toLowerCase())
  if (new Set(sharedMemberIds).size !== sharedMemberIds.length) {
    return response.status(400).json({ error: 'Duplicate sharing member IDs are not allowed.' })
  }

  try {
    const group = await Group.findById(groupId)

    if (!group) {
      return response.status(404).json({ error: 'Group not found.' })
    }

    const groupMemberIds = new Set(group.members.map((member) => member._id.toString()))

    // Payer and shared members must belong to this group, not just exist in MongoDB.
    
    if (!groupMemberIds.has(paidBy.toLowerCase())) {
      return response.status(400).json({ error: 'The payer must be a member of this group.' })
    }

    for (const memberId of sharedMemberIds) {
      if (!groupMemberIds.has(memberId)) {
        return response.status(400).json({ error: 'Every sharing member must belong to this group.' })
      }
    }

    const expense = await Expense.create({
      group: group._id,
      description: description.trim(),
      amountPaise,
      paidBy,
      sharedAmong,
    })

    return response.status(201).json({
      message: 'Expense created successfully.',
      expense,
    })
  } catch (error) {
    console.error('Failed to create expense:', error)
    return response.status(500).json({
      error: 'Unable to create the expense. Please try again.',
    })
  }
}

// Return member names with expense IDs so the client never needs to resolve IDs.
async function getGroupExpenses(request, response) {
  const { groupId } = request.params

  if (!isValidObjectId(groupId)) {
    return response.status(400).json({ error: 'A valid group ID is required.' })
  }

  try {
    const group = await Group.findById(groupId)

    if (!group) {
      return response.status(404).json({ error: 'Group not found.' })
    }

    const memberNames = new Map(
      group.members.map((member) => [member._id.toString(), member.name]),
    )
    const expenses = await Expense.find({ group: group._id })
    const expenseList = expenses.map((expense) => {
      const payerId = expense.paidBy.toString()

      if (!memberNames.has(payerId)) {
        throw new Error('Expense payer is not a member of the group.')
      }

      const sharedMembers = expense.sharedAmong.map((memberId) => {
        const id = memberId.toString()

        if (!memberNames.has(id)) {
          throw new Error('Expense sharing member is not a member of the group.')
        }

        return { memberId: id, name: memberNames.get(id) }
      })

      return {
        expenseId: expense._id.toString(),
        description: expense.description,
        amountPaise: expense.amountPaise,
        paidBy: { memberId: payerId, name: memberNames.get(payerId) },
        sharedAmong: sharedMembers,
        createdAt: expense.createdAt,
      }
    })

    return response.status(200).json({
      groupId: group._id.toString(),
      expenses: expenseList,
    })
  } catch (error) {
    console.error('Failed to retrieve group expenses:', error)
    return response.status(500).json({
      error: 'Unable to retrieve group expenses. Please try again.',
    })
  }
}

// EXPENSE DELETION
async function deleteExpense(request, response) {
  const { groupId, expenseId } = request.params

  if (!isValidObjectId(groupId)) {
    return response.status(400).json({ error: 'A valid group ID is required.' })
  }

  if (!isValidObjectId(expenseId)) {
    return response.status(400).json({ error: 'A valid expense ID is required.' })
  }

  try {
    const group = await Group.findById(groupId)

    if (!group) {
      return response.status(404).json({ error: 'Group not found.' })
    }

    const expense = await Expense.findOneAndDelete({
      _id: expenseId,
      group: group._id,
    })

    if (!expense) {
      return response.status(404).json({ error: 'Expense not found in this group.' })
    }

    return response.status(200).json({
      message: 'Expense deleted successfully.',
      expenseId: expense._id.toString(),
    })
  } catch (error) {
    console.error('Failed to delete expense:', error)
    return response.status(500).json({
      error: 'Unable to delete the expense. Please try again.',
    })
  }
}

export { createExpense, deleteExpense, getGroupExpenses }
