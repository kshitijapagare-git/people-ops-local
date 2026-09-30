import { useState, type FormEvent } from 'react'
import { Pagination, usePagination } from '../components/Pagination'
import { usePeopleOps } from '../state/PeopleOpsContext'
import type { DepartmentDraft } from '../types'

const blank: DepartmentDraft = { name: '', code: '' }

export function DepartmentsPage() {
  const { departments, createDepartment, updateDepartment, deleteDepartment } = usePeopleOps()
  const [draft, setDraft] = useState<DepartmentDraft>(blank)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const { page, pageCount, pageItems, setPage } = usePagination(departments)

  function close() {
    setDraft(blank)
    setEditingId(null)
    setFormOpen(false)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (editingId) updateDepartment(editingId, draft)
    else createDepartment(draft)
    close()
  }

  return (
    <section>
      <div className="page-header">
        <h2>Departments</h2>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setDraft(blank)
            setEditingId(null)
            setFormOpen(true)
          }}
        >
          + Add department
        </button>
      </div>
      {formOpen && (
        <form aria-label="Department form" className="card form-card" onSubmit={submit}>
          <div className="form-grid">
            <label>
              Name
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </label>
            <label>
              Code
              <input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} />
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
        </form>
      )}
      <div className="card table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 && (
              <tr>
                <td className="empty" colSpan={3}>
                  No departments yet.
                </td>
              </tr>
            )}
            {pageItems.map((department) => (
              <tr key={department.id}>
                <td>{department.name}</td>
                <td>{department.code}</td>
                <td>
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => {
                      setEditingId(department.id)
                      setDraft({ name: department.name, code: department.code })
                      setFormOpen(true)
                    }}
                  >
                    Edit
                  </button>
                  <button type="button" className="btn-link danger" onClick={() => deleteDepartment(department.id)}>
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
