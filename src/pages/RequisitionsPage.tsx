import { useState, type FormEvent } from 'react'
import { CurrencyInput } from '../components/CurrencyInput'
import { DateRangePicker } from '../components/DateRangePicker'
import { MultiSelect } from '../components/MultiSelect'
import { Pagination, usePagination } from '../components/Pagination'
import { RichTextEditor } from '../components/RichTextEditor'
import { TreeSelect } from '../components/TreeSelect'
import { StoreError } from '../data/peopleOpsStore'
import { htmlToPlainText } from '../lib/richText'
import { usePeopleOps } from '../state/PeopleOpsContext'
import type { RequisitionDraft, RequisitionStatus, SkillTag } from '../types'

const SKILL_OPTIONS: readonly SkillTag[] = ['REACT', 'TYPESCRIPT', 'PYTHON', 'SQL', 'DEVOPS', 'DESIGN', 'QA']

const STATUS_OPTIONS: readonly RequisitionStatus[] = ['DRAFT', 'OPEN', 'ON_HOLD', 'FILLED', 'CANCELLED']

const DESCRIPTION_PREVIEW_LENGTH = 80

const blank: RequisitionDraft = {
  orgUnitId: '',
  hiringManagerId: '',
  positionTitle: '',
  jobDescription: '',
  requiredSkills: [],
  openFrom: '',
  openUntil: '',
  salaryOffered: 0,
  status: 'DRAFT',
}

export function RequisitionsPage() {
  const {
    requisitions,
    orgUnits,
    getOrgUnit,
    getEmployee,
    listPeopleManagers,
    createRequisition,
    updateRequisition,
    deleteRequisition,
  } = usePeopleOps()
  const [draft, setDraft] = useState<RequisitionDraft>(blank)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const { page, pageCount, pageItems, setPage } = usePagination(requisitions)

  const peopleManagers = listPeopleManagers()

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
      if (editingId) updateRequisition(editingId, draft)
      else createRequisition(draft)
      close()
    } catch (err) {
      if (err instanceof StoreError) setError(err.message)
      else throw err
    }
  }

  function managerName(id: string): string {
    const employee = getEmployee(id)
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'
  }

  function describePreview(jobDescription: string): string {
    return htmlToPlainText(jobDescription).slice(0, DESCRIPTION_PREVIEW_LENGTH)
  }

  return (
    <section>
      <div className="page-header">
        <h2>Requisitions</h2>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            reset()
            setFormOpen(true)
          }}
        >
          + Add requisition
        </button>
      </div>
      {formOpen && (
        <form aria-label="Requisition form" className="card form-card" onSubmit={submit}>
          <div className="form-grid">
            <label>
              Position title
              <input
                value={draft.positionTitle}
                onChange={(e) => setDraft({ ...draft, positionTitle: e.target.value })}
              />
            </label>
            <label>
              Team
              <TreeSelect
                nodes={orgUnits}
                value={draft.orgUnitId || null}
                onSelect={(id) => setDraft({ ...draft, orgUnitId: id })}
                isSelectable={(node) => node.kind === 'TEAM'}
              />
            </label>
            <label>
              Hiring manager
              <select
                value={draft.hiringManagerId}
                onChange={(e) => setDraft({ ...draft, hiringManagerId: e.target.value })}
              >
                <option value="">Select a hiring manager</option>
                {peopleManagers.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Salary offered
              <CurrencyInput
                value={draft.salaryOffered}
                onChange={(next) => setDraft({ ...draft, salaryOffered: next })}
              />
            </label>
            <label>
              Status
              <select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as RequisitionStatus })}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Required skills
              <MultiSelect
                options={SKILL_OPTIONS}
                value={draft.requiredSkills}
                onChange={(next) => setDraft({ ...draft, requiredSkills: next })}
              />
            </label>
            <label>
              Open window
              <DateRangePicker
                from={draft.openFrom}
                until={draft.openUntil}
                onChange={(from, until) => setDraft({ ...draft, openFrom: from, openUntil: until })}
              />
            </label>
          </div>
          <label>
            Job description
            <RichTextEditor
              value={draft.jobDescription}
              onChange={(html) => setDraft({ ...draft, jobDescription: html })}
            />
          </label>
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
              <th>Position</th>
              <th>Team</th>
              <th>Hiring manager</th>
              <th>Description</th>
              <th>Skills</th>
              <th>Open from</th>
              <th>Open until</th>
              <th>Salary</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requisitions.length === 0 && (
              <tr>
                <td className="empty" colSpan={10}>
                  No requisitions yet.
                </td>
              </tr>
            )}
            {pageItems.map((requisition) => (
              <tr key={requisition.id}>
                <td>{requisition.positionTitle}</td>
                <td>{getOrgUnit(requisition.orgUnitId)?.name ?? 'Unknown'}</td>
                <td>{managerName(requisition.hiringManagerId)}</td>
                <td>{describePreview(requisition.jobDescription)}</td>
                <td>{requisition.requiredSkills.join(', ')}</td>
                <td>{requisition.openFrom}</td>
                <td>{requisition.openUntil}</td>
                <td>{requisition.salaryOffered}</td>
                <td>{requisition.status}</td>
                <td>
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => {
                      const { id: _id, ...rest } = requisition
                      setEditingId(requisition.id)
                      setDraft(rest)
                      setError(null)
                      setFormOpen(true)
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-link danger"
                    onClick={() => deleteRequisition(requisition.id)}
                  >
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
