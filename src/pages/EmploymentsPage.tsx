import { useState, type FormEvent } from 'react'
import { Pagination, usePagination } from '../components/Pagination'
import { Rating } from '../components/Rating'
import { Slider } from '../components/Slider'
import { Stepper } from '../components/Stepper'
import { ToggleGroup } from '../components/ToggleGroup'
import { StoreError } from '../data/peopleOpsStore'
import { usePeopleOps } from '../state/PeopleOpsContext'
import type { EmploymentDraft, EmploymentType } from '../types'

const blank: EmploymentDraft = {
  employeeId: '',
  jobRoleId: '',
  locationId: '',
  employmentType: 'FULL_TIME',
  noticePeriodDays: 0,
  weeklyHours: 40,
  fteAllocation: 100,
  probationRating: undefined,
  joinedOn: '',
  endDate: null,
}

const employmentTypeOptions: { value: EmploymentType; label: string }[] = [
  { value: 'FULL_TIME', label: 'Full time' },
  { value: 'PART_TIME', label: 'Part time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERN', label: 'Intern' },
]

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** True once joinedOn is more than 90 days before today. Exactly 90 days stays disabled. */
function isProbationEligible(joinedOn: string, today: Date): boolean {
  if (!joinedOn) return false
  const joined = new Date(joinedOn)
  if (Number.isNaN(joined.getTime())) return false
  const todayMidnight = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  const joinedMidnight = Date.UTC(joined.getUTCFullYear(), joined.getUTCMonth(), joined.getUTCDate())
  const diffDays = Math.floor((todayMidnight - joinedMidnight) / MS_PER_DAY)
  return diffDays > 90
}

export function EmploymentsPage() {
  const {
    employments,
    jobRoles,
    locations,
    getEmployee,
    getJobRole,
    getLocation,
    createEmployment,
    updateEmployment,
    deleteEmployment,
    listEmployeesWithoutActiveEmployment,
  } = usePeopleOps()
  const [draft, setDraft] = useState<EmploymentDraft>(blank)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const { page, pageCount, pageItems, setPage } = usePagination(employments)

  const today = new Date()
  const todayIso = today.toISOString().slice(0, 10)
  const baseEmployeeOptions = listEmployeesWithoutActiveEmployment(editingId ?? undefined)
  const currentEmployee = editingId ? getEmployee(draft.employeeId) : undefined
  const employeeOptions =
    currentEmployee && !baseEmployeeOptions.some((employee) => employee.id === currentEmployee.id)
      ? [...baseEmployeeOptions, currentEmployee]
      : baseEmployeeOptions
  const probationEnabled = isProbationEligible(draft.joinedOn, today)

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
      if (editingId) updateEmployment(editingId, draft)
      else createEmployment(draft)
      close()
    } catch (err) {
      if (err instanceof StoreError) setError(err.message)
      else throw err
    }
  }

  function setEmploymentType(next: EmploymentType) {
    setDraft((prev) => ({
      ...prev,
      employmentType: next,
      fteAllocation: next === 'FULL_TIME' ? 100 : prev.fteAllocation,
    }))
  }

  return (
    <section>
      <div className="page-header">
        <h2>Employments</h2>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            reset()
            setFormOpen(true)
          }}
        >
          + Add employment
        </button>
      </div>
      {formOpen && (
        <form aria-label="Employment form" className="card form-card" onSubmit={submit}>
          <div className="form-grid">
            <label>
              Employee
              <select value={draft.employeeId} onChange={(e) => setDraft({ ...draft, employeeId: e.target.value })}>
                <option value="">Select an employee</option>
                {employeeOptions.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Job role
              <select value={draft.jobRoleId} onChange={(e) => setDraft({ ...draft, jobRoleId: e.target.value })}>
                <option value="">Select a job role</option>
                {jobRoles.map((jobRole) => (
                  <option key={jobRole.id} value={jobRole.id}>
                    {jobRole.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Location
              <select value={draft.locationId} onChange={(e) => setDraft({ ...draft, locationId: e.target.value })}>
                <option value="">Select a location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Joined on
              <input
                type="date"
                value={draft.joinedOn}
                max={todayIso}
                onChange={(e) => setDraft({ ...draft, joinedOn: e.target.value })}
              />
            </label>
            <ToggleGroup
              label="Employment type"
              options={employmentTypeOptions}
              value={draft.employmentType}
              onChange={setEmploymentType}
            />
            <Stepper
              label="Notice period (days)"
              value={draft.noticePeriodDays}
              min={0}
              max={180}
              step={15}
              onChange={(value) => setDraft({ ...draft, noticePeriodDays: value })}
            />
            <Stepper
              label="Weekly hours"
              value={draft.weeklyHours}
              min={1}
              max={60}
              step={1}
              onChange={(value) => setDraft({ ...draft, weeklyHours: value })}
            />
            <Slider
              label="FTE allocation"
              value={draft.fteAllocation}
              min={10}
              max={100}
              step={5}
              suffix="%"
              disabled={draft.employmentType === 'FULL_TIME'}
              onChange={(value) => setDraft({ ...draft, fteAllocation: value })}
            />
            <label>
              Probation rating
              <Rating
                value={draft.probationRating ?? 0}
                onChange={(value) => setDraft({ ...draft, probationRating: value })}
                disabled={!probationEnabled}
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
              <th>Employee</th>
              <th>Role</th>
              <th>Location</th>
              <th>Employment type</th>
              <th>FTE</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employments.length === 0 && (
              <tr>
                <td className="empty" colSpan={6}>
                  No employments yet.
                </td>
              </tr>
            )}
            {pageItems.map((employment) => {
              const employee = getEmployee(employment.employeeId)
              const jobRole = getJobRole(employment.jobRoleId)
              const location = getLocation(employment.locationId)
              return (
                <tr key={employment.id}>
                  <td>{employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'}</td>
                  <td>{jobRole?.title ?? 'Unknown'}</td>
                  <td>{location?.name ?? 'Unknown'}</td>
                  <td>{employment.employmentType}</td>
                  <td>{employment.fteAllocation}%</td>
                  <td>
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() => {
                        const { id: _id, ...rest } = employment
                        setEditingId(employment.id)
                        setDraft(rest)
                        setError(null)
                        setFormOpen(true)
                      }}
                    >
                      Edit
                    </button>
                    <button type="button" className="btn-link danger" onClick={() => deleteEmployment(employment.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageCount={pageCount} onChange={setPage} />
    </section>
  )
}
