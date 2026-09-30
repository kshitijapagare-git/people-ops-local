import { useState, type FormEvent } from 'react'
import { Pagination, usePagination } from '../components/Pagination'
import { usePeopleOps } from '../state/PeopleOpsContext'
import type { JobRoleDraft } from '../types'

const blank: JobRoleDraft = { title: '', isPeopleManager: false }

export function JobRolesPage() {
  const { jobRoles, createJobRole, updateJobRole, deleteJobRole } = usePeopleOps()
  const [draft, setDraft] = useState<JobRoleDraft>(blank)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const { page, pageCount, pageItems, setPage } = usePagination(jobRoles)

  function close() {
    setDraft(blank)
    setEditingId(null)
    setFormOpen(false)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (editingId) updateJobRole(editingId, draft)
    else createJobRole(draft)
    close()
  }

  return (
    <section>
      <div className="page-header">
        <h2>Job roles</h2>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setDraft(blank)
            setEditingId(null)
            setFormOpen(true)
          }}
        >
          + Add job role
        </button>
      </div>
      {formOpen && (
        <form aria-label="Job role form" className="card form-card" onSubmit={submit}>
          <div className="form-grid">
            <label>
              Title
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </label>
            <label>
              People manager
              <input
                type="checkbox"
                checked={draft.isPeopleManager}
                onChange={(e) => setDraft({ ...draft, isPeopleManager: e.target.checked })}
              />
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
              <th>Title</th>
              <th>People manager</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobRoles.length === 0 && (
              <tr>
                <td className="empty" colSpan={3}>
                  No job roles yet.
                </td>
              </tr>
            )}
            {pageItems.map((jobRole) => (
              <tr key={jobRole.id}>
                <td>{jobRole.title}</td>
                <td>{jobRole.isPeopleManager ? 'Yes' : 'No'}</td>
                <td>
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => {
                      setEditingId(jobRole.id)
                      setDraft({ title: jobRole.title, isPeopleManager: jobRole.isPeopleManager })
                      setFormOpen(true)
                    }}
                  >
                    Edit
                  </button>
                  <button type="button" className="btn-link danger" onClick={() => deleteJobRole(jobRole.id)}>
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
