import mongoose from 'mongoose'

// Member subdocuments keep their generated IDs for expense payer/share references.
const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
})

// A group is valid only when it has a name and at least two named members.
const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  members: {
    type: [memberSchema],
    required: true,
    validate: {
      validator: (members) => Array.isArray(members) && members.length >= 2,
      message: 'A group must have at least two members.',
    },
  },
})

const Group = mongoose.model('Group', groupSchema)

export default Group
