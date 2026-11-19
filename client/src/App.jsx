import { Navigate, Route, Routes } from 'react-router-dom'
import Header from './components/Header/Header'
import GroupsPage from './pages/GroupsPage'
import ExpensesPage from './pages/ExpensesPage'
import useExpenses from './hooks/useExpenses'
import useGroups from './hooks/useGroups'
import './App.css'

// ==========================================
// APPLICATION ROUTING AND SHARED STATE
// ==========================================
function App() {
  // Both pages use the same selected group and its current expense dashboard data.
  const groupState = useGroups()
  const expenseState = useExpenses(groupState.selectedGroup?._id)

  return (
    <>
      <Header />
      <main className="app">
        <Routes>
          <Route path="/" element={<Navigate to="/groups" replace />} />
          <Route
            path="/groups"
            element={
              <GroupsPage
                groupState={groupState}
              />
            }
          />
          <Route
            path="/expenses"
            element={
              <ExpensesPage
                groupState={groupState}
                expenseState={expenseState}
              />
            }
          />
          <Route path="*" element={<Navigate to="/groups" replace />} />
        </Routes>
      </main>
    </>
  )
}

export default App
