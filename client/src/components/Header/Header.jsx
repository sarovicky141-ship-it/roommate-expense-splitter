import { NavLink } from 'react-router-dom'
import './Header.css'

// Shared navigation keeps the current page visible in the application header.
function Header() {
  return (
    <header className="page-header">
      <div className="header-inner">
        <NavLink className="brand" to="/groups">
          Roommate Expense Splitter
        </NavLink>
        <nav className="main-navigation" aria-label="Main navigation">
          <NavLink
            className={({ isActive }) =>
              `navigation-link${isActive ? ' is-active' : ''}`
            }
            to="/groups"
          >
            Groups
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `navigation-link${isActive ? ' is-active' : ''}`
            }
            to="/expenses"
          >
            Expenses
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Header
