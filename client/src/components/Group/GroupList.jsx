import { useState } from 'react'
import EmptyState from '../common/EmptyState'
import ErrorMessage from '../common/ErrorMessage'
import './Group.css'

// Render persisted groups and mark the one shared by the rest of the app.
function GroupList({ groups, selectedGroupId, onSelect, onDelete }) {
  const [pendingDeleteGroup, setPendingDeleteGroup] = useState(null)
  const [deletingGroupId, setDeletingGroupId] = useState(null)
  const [deleteError, setDeleteError] = useState('')

  async function confirmDeleteGroup() {
    if (!pendingDeleteGroup) return

    setDeletingGroupId(pendingDeleteGroup._id)
    setDeleteError('')

    try {
      await onDelete(pendingDeleteGroup._id)
      setPendingDeleteGroup(null)
    } catch (error) {
      setDeleteError(
        error instanceof Error && error.message
          ? error.message
          : 'Unable to delete this group. Please try again.',
      )
    } finally {
      setDeletingGroupId(null)
    }
  }

  return (
    <section className="panel" aria-labelledby="group-list-heading">
      <div className="section-heading">
        <img
          className="group-section-icon"
          src="/images/group.png"
          alt=""
          aria-hidden="true"
        />
        <div>
          <h2 id="group-list-heading">Your groups</h2>
          <p>Select a saved group to view its expenses and balances.</p>
        </div>
      </div>

      {groups.length === 0 ? (
        <EmptyState message="No saved groups yet. Create one to get started." />
      ) : (
        <div className="group-list">
          {groups.map((group) => (
            <article
              className={`group-option${group._id === selectedGroupId ? ' is-selected' : ''}`}
              key={group._id}
            >
              <button
                className="group-option-select"
                type="button"
                onClick={() => onSelect(group._id)}
                aria-pressed={group._id === selectedGroupId}
              >
                <small className="group-member-count">
                  {group.members.length} members
                </small>
                <strong className="group-option-name">{group.name}</strong>
                <span className="group-member-preview">
                  {group.members.map((member) => member.name).join(', ')}
                </span>
              </button>
              <button
                className="delete-group-button"
                type="button"
                aria-label={`Delete ${group.name} group`}
                title={`Delete ${group.name} group`}
                disabled={deletingGroupId !== null}
                onClick={() => {
                  setDeleteError('')
                  setPendingDeleteGroup(group)
                }}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="m19 6-1 14H6L5 6" />
                  <path d="M10 11v5M14 11v5" />
                </svg>
              </button>
            </article>
          ))}
        </div>
      )}

      {pendingDeleteGroup && (
        <div className="delete-group-backdrop">
          <section
            className="delete-group-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-group-heading"
            aria-describedby="delete-group-description"
          >
            <h2 id="delete-group-heading">Delete group?</h2>
            <p id="delete-group-description">
              Are you sure you want to delete this group? All expenses and related data belonging to this group will also be deleted. This action cannot be undone.
            </p>
            <ErrorMessage message={deleteError} />
            <div className="delete-group-actions">
              <button
                className="button button-secondary"
                type="button"
                disabled={deletingGroupId !== null}
                onClick={() => setPendingDeleteGroup(null)}
              >
                Cancel
              </button>
              <button
                className="button delete-group-confirm"
                type="button"
                disabled={deletingGroupId !== null}
                onClick={confirmDeleteGroup}
              >
                {deletingGroupId !== null ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}

export default GroupList
