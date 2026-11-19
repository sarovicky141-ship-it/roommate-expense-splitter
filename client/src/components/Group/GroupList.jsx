import EmptyState from '../common/EmptyState'
import './Group.css'

// Render persisted groups and mark the one shared by the rest of the app.
function GroupList({ groups, selectedGroupId, onSelect }) {
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
            <button
              className={`group-option${group._id === selectedGroupId ? ' is-selected' : ''}`}
              type="button"
              key={group._id}
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
          ))}
        </div>
      )}
    </section>
  )
}

export default GroupList
