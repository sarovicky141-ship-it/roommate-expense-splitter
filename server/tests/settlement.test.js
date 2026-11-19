import assert from 'node:assert/strict'
import { test } from 'node:test'
import Expense from '../models/Expense.js'
import Group from '../models/Group.js'
import { calculateGroupBalances } from '../controllers/balanceController.js'
import { getGroupSettlements } from '../controllers/settlementController.js'

function createResponse() {
  return {
    body: null,
    statusCode: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(body) {
      this.body = body
      return this
    },
  }
}

test('one debtor pays one creditor ₹500', async (context) => {
  const group = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Roommates',
    members: [
      { _id: 'ravi-id', name: 'Ravi' },
      { _id: 'anu-id', name: 'Anu' },
    ],
  }
  const expenses = [{
    group: group._id,
    amountPaise: 100000,
    paidBy: 'ravi-id',
    sharedAmong: ['ravi-id', 'anu-id'],
  }]

  context.mock.method(Group, 'findById', async () => group)
  context.mock.method(Expense, 'find', async () => expenses)

  const response = createResponse()
  await getGroupSettlements({ params: { groupId: group._id } }, response)

  assert.equal(response.statusCode, 200)
  assert.deepEqual(response.body.settlements, [{
    from: { memberId: 'anu-id', name: 'Anu' },
    to: { memberId: 'ravi-id', name: 'Ravi' },
    amountPaise: 50000,
  }])
})

test('an expense shared only with the payer needs no settlement', async (context) => {
  const group = {
    _id: '507f1f77bcf86cd799439012',
    name: 'Roommates',
    members: [
      { _id: 'ravi-id', name: 'Ravi' },
      { _id: 'anu-id', name: 'Anu' },
    ],
  }
  const expenses = [{
    group: group._id,
    amountPaise: 50000,
    paidBy: 'ravi-id',
    sharedAmong: ['ravi-id'],
  }]

  context.mock.method(Group, 'findById', async () => group)
  context.mock.method(Expense, 'find', async () => expenses)

  const [raviBalance] = await calculateGroupBalances(group)
  assert.equal(raviBalance.totalPaidPaise, 50000)
  assert.equal(raviBalance.totalSharePaise, 50000)
  assert.equal(raviBalance.netBalancePaise, 0)

  const response = createResponse()
  await getGroupSettlements({ params: { groupId: group._id } }, response)

  assert.equal(response.statusCode, 200)
  assert.deepEqual(response.body.settlements, [])
})
