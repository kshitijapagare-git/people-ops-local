import { useEffect, useState } from 'react'
import { DepartmentsPage } from './pages/DepartmentsPage'
import { EmployeesPage } from './pages/EmployeesPage'
import { JobRolesPage } from './pages/JobRolesPage'
import { LocationsPage } from './pages/LocationsPage'

type View = 'departments' | 'employees' | 'job-roles' | 'locations'

const navItems: { view: View; label: string; icon: string }[] = [
  { view: 'departments', label: 'Departments', icon: '🏢' },
  { view: 'employees', label: 'Employees', icon: '👤' },
  { view: 'job-roles', label: 'Job Roles', icon: '🧾' },
  { view: 'locations', label: 'Locations', icon: '📍' },
]

function viewFromHash(): View {
  switch (window.location.hash) {
    case '#/employees':
      return 'employees'
    case '#/job-roles':
      return 'job-roles'
    case '#/locations':
      return 'locations'
    default:
      return 'departments'
  }
}

export function App() {
  const [view, setView] = useState<View>(viewFromHash)

  useEffect(() => {
    const onHashChange = () => setView(viewFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  function navigate(next: View) {
    window.location.hash = `#/${next}`
    setView(next)
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1 className="brand">
          <span aria-hidden="true">🧑‍💼</span> People Ops
        </h1>
        <nav className="nav">
          {navItems.map((item) => (
            <button
              key={item.view}
              type="button"
              className="nav-item"
              aria-current={view === item.view ? 'page' : undefined}
              onClick={() => navigate(item.view)}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="content">
        {view === 'departments' && <DepartmentsPage />}
        {view === 'employees' && <EmployeesPage />}
        {view === 'job-roles' && <JobRolesPage />}
        {view === 'locations' && <LocationsPage />}
      </main>
    </div>
  )
}
