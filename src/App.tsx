import { useEffect, useState } from 'react'
import { DepartmentsPage } from './pages/DepartmentsPage'
import { EmployeesPage } from './pages/EmployeesPage'

type View = 'departments' | 'employees'

const navItems: { view: View; label: string; icon: string }[] = [
  { view: 'departments', label: 'Departments', icon: '🏢' },
  { view: 'employees', label: 'Employees', icon: '👤' },
]

function viewFromHash(): View {
  return window.location.hash === '#/employees' ? 'employees' : 'departments'
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
      <main className="content">{view === 'departments' ? <DepartmentsPage /> : <EmployeesPage />}</main>
    </div>
  )
}
