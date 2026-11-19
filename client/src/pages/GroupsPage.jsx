import { useNavigate } from 'react-router-dom'
import CreateGroup from '../components/Group/CreateGroup'
import GroupDetails from '../components/Group/GroupDetails'
import GroupList from '../components/Group/GroupList'
import ErrorMessage from '../components/common/ErrorMessage'
import Loading from '../components/common/Loading'
import './Pages.css'

// Compose group creation, selection, and selected-group details on one page.
function GroupsPage({ groupState }) {
  const navigate = useNavigate()

  return (
    <div className="page-content">
      <div className="page-intro">
        <p className="page-kicker">Manage your shared living expenses</p>
        <h1>Groups</h1>
        <p>Create a group or select one to see its members and expenses.</p>
      </div>

      <ErrorMessage message={groupState.error} />

      {groupState.loadingGroups ? (
        <Loading message="Loading your saved groups..." />
      ) : (
        <>
          <CreateGroup onCreate={groupState.createNewGroup} />
          <GroupList
            groups={groupState.groups}
            selectedGroupId={groupState.selectedGroup?._id || ''}
            onSelect={groupState.selectGroup}
            onDelete={groupState.deleteSavedGroup}
          />
          <GroupDetails
            group={groupState.selectedGroup}
            onNavigate={() => navigate('/expenses')}
          />
        </>
      )}
    </div>
  )
}

export default GroupsPage
