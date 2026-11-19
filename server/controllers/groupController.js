import Group from '../models/Group.js'
import Expense from '../models/Expense.js'

// Validate MongoDB IDs before passing them to Mongoose queries.
function isValidObjectId(id) {
  return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)
}

// GROUP RETRIEVAL
async function getGroups(_request, response) {
  try {
    const groups = await Group.find().sort({ _id: -1 })
    return response.status(200).json({ groups })
  } catch (error) {
    console.error('Failed to retrieve groups:', error)
    return response.status(500).json({
      error: 'Unable to retrieve groups. Please try again.',
    })
  }
}

// Load the persisted group used by the selected-group workflow.
async function getGroupById(request, response) {
  const { groupId } = request.params

  if (!isValidObjectId(groupId)) {
    return response.status(400).json({ error: 'A valid group ID is required.' })
  }

  try {
    const group = await Group.findById(groupId)

    if (!group) {
      return response.status(404).json({ error: 'Group not found.' })
    }

    return response.status(200).json({ group })
  } catch (error) {
    console.error('Failed to retrieve group:', error)
    return response.status(500).json({
      error: 'Unable to retrieve the group. Please try again.',
    })
  }
}

// Delete a group's expenses before removing the group to avoid orphaned records.
async function deleteGroup(request, response) {
  const { groupId } = request.params

  if (!isValidObjectId(groupId)) {
    return response.status(400).json({ error: 'A valid group ID is required.' })
  }

  try {
    const group = await Group.findById(groupId)

    if (!group) {
      return response.status(404).json({ error: 'Group not found.' })
    }

    await Expense.deleteMany({ group: group._id })
    await group.deleteOne()

    return response.status(200).json({
      message: 'Group and its expenses deleted successfully.',
    })
  } catch (error) {
    console.error('Failed to delete group:', error)
    return response.status(500).json({
      error: 'Unable to delete the group. Please try again.',
    })
  }
}

// GROUP CREATION
async function createGroup(request, response) {
  const { name, members } = request.body || {}

  if (typeof name !== 'string' || name.trim() === '') {
    return response.status(400).json({ error: 'Group name is required.' })
  }

  if (!Array.isArray(members)) {
    return response.status(400).json({ error: 'Members must be provided as an array.' })
  }

  if (members.length < 2) {
    return response.status(400).json({ error: 'A group must have at least two members.' })
  }

  // Trim member names before saving so stored group data is consistent.
  const cleanedMembers = []

  for (const member of members) {
    if (
      !member ||
      typeof member !== 'object' ||
      Array.isArray(member) ||
      typeof member.name !== 'string' ||
      member.name.trim() === ''
    ) {
      return response.status(400).json({ error: 'Each member must have a non-empty name.' })
    }

    cleanedMembers.push({ name: member.name.trim() })
  }

  try {
    const group = await Group.create({
      name: name.trim(),
      members: cleanedMembers,
    })

    return response.status(201).json({
      message: 'Group created successfully.',
      group,
    })
  } catch (error) {
    console.error('Failed to create group:', error)
    return response.status(500).json({
      error: 'Unable to create the group. Please try again.',
    })
  }
}

export { createGroup, deleteGroup, getGroupById, getGroups }
