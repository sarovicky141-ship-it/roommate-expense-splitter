import { useEffect, useRef, useState } from 'react'
import {
  createGroup as saveGroup,
  deleteGroup as removeGroup,
  getGroupById,
  getGroups,
} from '../services/groupService'

const SELECTED_GROUP_KEY = 'roommate-expense-splitter-selected-group-id'

// GROUP LOADING AND SELECTION
function useGroups() {
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [error, setError] = useState('')
  const selectionRequestId = useRef(0)

  // Restore the saved group after loading the current group list from MongoDB.
  useEffect(() => {
    let cancelled = false

    async function loadGroups() {
      try {
        const result = await getGroups()

        if (!Array.isArray(result.groups)) {
          throw new Error('The server returned an invalid group list.')
        }

        if (cancelled) return

        setGroups(result.groups)
        const savedGroupId = window.localStorage.getItem(SELECTED_GROUP_KEY)
        const restoredGroup =
          result.groups.find((group) => group._id === savedGroupId) ||
          result.groups[0] ||
          null

        setSelectedGroup(restoredGroup)

        if (restoredGroup) {
          window.localStorage.setItem(SELECTED_GROUP_KEY, restoredGroup._id)
        } else {
          window.localStorage.removeItem(SELECTED_GROUP_KEY)
        }
      } catch (requestError) {
        if (!cancelled) setError(requestError.message)
      } finally {
        if (!cancelled) setLoadingGroups(false)
      }
    }

    loadGroups()
    return () => {
      cancelled = true
    }
  }, [])

  // Save a new group and select it immediately for the next workflow step.
  async function createNewGroup(groupDetails) {
    const result = await saveGroup(groupDetails)
    const savedGroup = result.group

    selectionRequestId.current += 1
    setGroups((currentGroups) => [
      savedGroup,
      ...currentGroups.filter((group) => group._id !== savedGroup._id),
    ])
    setSelectedGroup(savedGroup)
    setError('')
    window.localStorage.setItem(SELECTED_GROUP_KEY, savedGroup._id)

    return result
  }

  // Remove the group from local state only after the server confirms deletion.
  async function deleteSavedGroup(groupId) {
    await removeGroup(groupId)

    selectionRequestId.current += 1
    setGroups((currentGroups) =>
      currentGroups.filter((group) => group._id !== groupId),
    )
    setSelectedGroup((currentGroup) =>
      currentGroup?._id === groupId ? null : currentGroup,
    )
    setError('')

    if (window.localStorage.getItem(SELECTED_GROUP_KEY) === groupId) {
      window.localStorage.removeItem(SELECTED_GROUP_KEY)
    }
  }

  // Fetch fresh details when selection changes; ignore responses from older selections.
  async function selectGroup(groupId) {
    const group =
      groups.find((savedGroup) => savedGroup._id === groupId) || null
    const currentRequestId = ++selectionRequestId.current

    setSelectedGroup(group)
    setError('')

    if (group) {
      window.localStorage.setItem(SELECTED_GROUP_KEY, group._id)
      try {
        const result = await getGroupById(group._id)
        if (currentRequestId === selectionRequestId.current) {
          setSelectedGroup(result.group)
        }
      } catch (requestError) {
        if (currentRequestId === selectionRequestId.current) {
          setError(requestError.message)
        }
      }
    } else {
      window.localStorage.removeItem(SELECTED_GROUP_KEY)
    }
  }

  return {
    groups,
    selectedGroup,
    loadingGroups,
    error,
    createNewGroup,
    deleteSavedGroup,
    selectGroup,
  }
}

export default useGroups
