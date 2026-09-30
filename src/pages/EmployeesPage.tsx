import { useState, type FormEvent } from 'react'
import { Pagination, usePagination } from '../components/Pagination'
import { StoreError } from '../data/peopleOpsStore'
import { usePeopleOps } from '../state/PeopleOpsContext'
import type { EmployeeDraft } from '../types'

const blank: EmployeeDraft = { firstName: '', lastName: '', email: '', phone: '', departmentId: '' }

export function EmployeesPage() {
  const { employees, departments, getDepartment, createEmployee, updateEmployee, deleteEmployee } =
    usePeopleOps()
  const [draft, setDraft] = useState<EmployeeDraft>(blank)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const { page, pageCount, pageItems, setPage } = usePagination(employees)

  function reset() {
    setDraft(blank)
    setEditingId(null)
    setError(null)
  }

  function close() {
    reset()
    setFormOpen(false)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    try {
      if (editingId) updateEmployee(editingId, draft)
      else createEmployee(draft)
      close()
    } catch (err) {
      if (err instanceof StoreError) setError(err.message)
      else throw err
    }
  }

  return (
    <section>
      <div className="page-header">
        <h2>Employees</h2>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            reset()
            setFormOpen(true)
          }}
        >
          + Add employee
        </button>
      </div>
      {formOpen && (
        <form aria-label="Employee form" className="card form-card" onSubmit={submit}>
          <div className="form-grid">
            <label>
              First name
              <input value={draft.firstName} onChange={(e) => setDraft({ ...draft, firstName: e.target.value })} />
            </label>
            <label>
              Last name
              <input value={draft.lastName} onChange={(e) => setDraft({ ...draft, lastName: e.target.value })} />
            </label>
            <label>
              Email
              <input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            </label>
            <label>
              Phone
              <input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
            </label>
            <label>
              Department
              <select
                value={draft.departmentId}
                onChange={(e) => setDraft({ ...draft, departmentId: e.target.value })}
              >
                <option value="">Select a department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Save' : 'Add'}
            </button>
            <button type="button" className="btn" onClick={close}>
              Cancel
            </button>
          </div>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
        </form>
      )}
      <div className="card table-card">
        <table className="table">
          <thead>
            <tr>
              <th>First name</th>
              <th>Last name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 && (
              <tr>
                <td className="empty" colSpan={6}>
                  No employees yet.
                </td>
              </tr>
            )}
            {pageItems.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.firstName}</td>
                <td>{employee.lastName}</td>
                <td>{employee.email}</td>
                <td>{employee.phone}</td>
                <td>{getDepartment(employee.departmentId)?.name ?? 'Unknown'}</td>
                <td>
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => {
                      const { id: _id, ...rest } = employee
                      setEditingId(employee.id)
                      setDraft(rest)
                      setError(null)
                      setFormOpen(true)
                    }}
                  >
                    Edit
                  </button>
                  <button type="button" className="btn-link danger" onClick={() => deleteEmployee(employee.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageCount={pageCount} onChange={setPage} />
    </section>
  )
}
