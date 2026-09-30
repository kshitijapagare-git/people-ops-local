import { useState, type FormEvent } from 'react'
import { DataTable, type DataTableColumn } from '../components/DataTable'
import { Modal } from '../components/Modal'
import { CurrencyInput } from '../components/CurrencyInput'
import { Switch } from '../components/Switch'
import { Pagination, usePagination } from '../components/Pagination'
import { StoreError } from '../data/peopleOpsStore'
import { usePeopleOps } from '../state/PeopleOpsContext'
import type { JobRole, JobRoleDraft, JobRoleLevel } from '../types'

const levels: JobRoleLevel[] = ['INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'PRINCIPAL']

const blank: JobRoleDraft = { title: '', level: 'MID', baseSalary: 0, isPeopleManager: false }

/** Formats whole-number minor units (cents) as a decimal string using only string/integer operations (no floating-point division). */
function formatMinorUnits(minorUnits: number): string {
  const negative = minorUnits < 0
  const digits = Math.abs(minorUnits).toString().padStart(3, '0')
  const whole = digits.slice(0, -2)
  const cents = digits.slice(-2)
  return `${negative ? '-' : ''}${whole}.${cents}`
}

export function JobRolesPage() {
  const { jobRoles, createJobRole, updateJobRole, deleteJobRole } = usePeopleOps()
  const [draft, setDraft] = useState<JobRoleDraft>(blank)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const { page, pageCount, pageItems, setPage } = usePagination(jobRoles)

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
    if (!draft.title.trim()) {
      setError('Title is required')
      return
    }
    if (!draft.baseSalary || draft.baseSalary <= 0) {
      setError('Base salary must be greater than zero')
      return
    }
    const normalizedTitle = draft.title.trim().toLowerCase()
    const hasDuplicateTitle = jobRoles.some(
      (jobRole) =>
        jobRole.id !== editingId &&
        jobRole.level === draft.level &&
        jobRole.title.trim().toLowerCase() === normalizedTitle,
    )
    if (hasDuplicateTitle) {
      setError(`A job role titled "${draft.title.trim()}" already exists for level ${draft.level}`)
      return
    }
    try {
      if (editingId) updateJobRole(editingId, draft)
      else createJobRole(draft)
      close()
    } catch (err) {
      if (err instanceof StoreError) setError(err.message)
      else throw err
    }
  }

  const columns: DataTableColumn<JobRole>[] = [
    { key: 'title', header: 'Title', sortable: true, render: (row) => row.title },
    { key: 'level', header: 'Level', sortable: true, render: (row) => row.level },
    {
      key: 'baseSalary',
      header: 'Base salary',
      sortable: true,
      sortValue: (row) => row.baseSalary,
      render: (row) => formatMinorUnits(row.baseSalary),
    },
    {
      key: 'isPeopleManager',
      header: 'People manager',
      render: (row) => (row.isPeopleManager ? 'Yes' : 'No'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <>
          <button
            type="button"
            className="btn-link"
            onClick={() => {
              const { id: _id, ...rest } = row
              setEditingId(row.id)
              setDraft(rest)
              setError(null)
              setFormOpen(true)
            }}
          >
            Edit
          </button>
          <button type="button" className="btn-link danger" onClick={() => deleteJobRole(row.id)}>
            Delete
          </button>
        </>
      ),
    },
  ]

  return (
    <section>
      <div className="page-header">
        <h2>Job Roles</h2>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            reset()
            setFormOpen(true)
          }}
        >
          + Add job role
        </button>
      </div>
      <Modal isOpen={formOpen} title={editingId ? 'Edit job role' : 'Add job role'} onClose={close}>
        <form aria-label="Job role form" onSubmit={submit}>
          <div className="form-grid">
            <label>
              Title
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </label>
            <label>
              Level
              <select
                value={draft.level}
                onChange={(e) => setDraft({ ...draft, level: e.target.value as JobRoleLevel })}
              >
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Base salary
              <CurrencyInput
                value={draft.baseSalary}
                onChange={(minorUnits) => setDraft({ ...draft, baseSalary: minorUnits })}
                required
              />
            </label>
            <Switch
              checked={draft.isPeopleManager}
              onChange={(checked) => setDraft({ ...draft, isPeopleManager: checked })}
              label="People manager"
            />
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
      </Modal>
      <div className="card table-card">
        <DataTable columns={columns} rows={pageItems} emptyMessage="No job roles yet." />
      </div>
      <Pagination page={page} pageCount={pageCount} onChange={setPage} />
    </section>
  )
}
