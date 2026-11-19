import { useRef, useState } from 'react'
import ErrorMessage from '../common/ErrorMessage'
import './Group.css'

// GROUP FORM AND MEMBER MANAGEMENT
function CreateGroup({ onCreate }) {
  const [name, setName] = useState('')
  const [members, setMembers] = useState([
    { id: 1, name: '' },
    { id: 2, name: '' },
  ])
  const [message, setMessage] = useState(null)
  const nextMemberId = useRef(3)

  // Keep member edits keyed by a stable local ID while rows are added or removed.
  function updateMember(memberId, memberName) {
    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.id === memberId ? { ...member, name: memberName } : member,
      ),
    )
  }

  function addMember() {
    setMembers((currentMembers) => [
      ...currentMembers,
      { id: nextMemberId.current++, name: '' },
    ])
  }

  function removeMember(memberId) {
    setMembers((currentMembers) =>
      currentMembers.filter((member) => member.id !== memberId),
    )
  }

  // Validate the form before sending trimmed group data to the API.
  async function handleSubmit(event) {
    event.preventDefault()
    setMessage(null)

    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Enter a group name.' })
      return
    }

    if (members.length < 2) {
      setMessage({ type: 'error', text: 'Add at least two members.' })
      return
    }

    if (members.some((member) => !member.name.trim())) {
      setMessage({ type: 'error', text: 'Enter a name for every member.' })
      return
    }

    try {
      const result = await onCreate({
        name: name.trim(),
        members: members.map((member) => ({ name: member.name.trim() })),
      })

      setName('')
      setMembers([
        { id: nextMemberId.current++, name: '' },
        { id: nextMemberId.current++, name: '' },
      ])
      setMessage({
        type: 'success',
        text: result.message || 'Group created successfully.',
      })
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  return (
    <section className="panel" aria-labelledby="create-group-heading">
      <div className="section-heading">
        <img
          className="group-section-icon"
          src="/images/add-user.png"
          alt=""
          aria-hidden="true"
        />
        <div>
          <h2 id="create-group-heading">Create a group</h2>
          <p>Add a group name and at least two members.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="group-name">Group name</label>
        <input
          id="group-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Chennai Mates"
        />

        <div className="members-heading">
          <h3>Members</h3>
          <span>At least 2</span>
        </div>

        <div className="member-inputs">
          {members.map((member, index) => (
            <div className="member-input-row" key={member.id}>
              <label className="visually-hidden" htmlFor={`member-${member.id}`}>
                Member {index + 1} name
              </label>
              <input
                id={`member-${member.id}`}
                type="text"
                value={member.name}
                onChange={(event) => updateMember(member.id, event.target.value)}
                placeholder={`Member ${index + 1} name`}
              />
              <button
                className="button button-remove"
                type="button"
                onClick={() => removeMember(member.id)}
                disabled={members.length <= 2}
                aria-label={`Remove member ${index + 1}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button className="button button-secondary" type="button" onClick={addMember}>
            Add member
          </button>
          <button className="button button-primary" type="submit">
            Create group
          </button>
        </div>

        {message?.type === 'error' && <ErrorMessage message={message.text} />}
        {message?.type === 'success' && (
          <p className="message message-success group-create-success" role="status">
            <img src="/images/done.png" alt="" aria-hidden="true" />
            <span>{message.text}</span>
          </p>
        )}
      </form>
    </section>
  )
}

export default CreateGroup
