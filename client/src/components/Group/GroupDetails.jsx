import EmptyState from '../common/EmptyState'
import './Group.css'

// Show the selected group's full member list and its expense-page action.
function GroupDetails({ group, onNavigate }) {
  return (
    <section className="panel group-details" aria-labelledby="group-details-heading">
      <div className="group-details-heading">
        <div className="section-heading">
          <img
            className="group-section-icon"
            src="/images/information-button.png"
            alt=""
            aria-hidden="true"
          />
          <div>
            <h2 id="group-details-heading">
              {group ? group.name : 'Selected group'}
            </h2>
            <p>
              {group
                ? `${group.members.length} group members`
                : 'Choose a group to view its information.'}
            </p>
          </div>
        </div>
        <button
          className="button button-primary"
          type="button"
          disabled={!group}
          onClick={onNavigate}
        >
          Expenses Split ↗
        </button>
      </div>

      {group ? (
        <>
          <ul className="group-member-list">
            {group.members.map((member) => (
              <li key={member._id}>{member.name}</li>
            ))}
          </ul>

          {group.createdAt && (
            <p className="group-created-date">
              Created {new Date(group.createdAt).toLocaleDateString('en-IN')}
            </p>
          )}
        </>
      ) : (
        <EmptyState message="Create a group or select a saved group to continue to expenses." />
      )}
    </section>
  )
}

export default GroupDetails
