import { sendRequest } from './api'

// Group API requests
function getGroups() {
  return sendRequest('/groups')
}

function getGroupById(groupId) {
  return sendRequest(`/groups/${groupId}`)
}

function createGroup(group) {
  return sendRequest('/groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(group),
  })
}

function deleteGroup(groupId) {
  return sendRequest(`/groups/${groupId}`, {
    method: 'DELETE',
  })
}

export { createGroup, deleteGroup, getGroupById, getGroups }
