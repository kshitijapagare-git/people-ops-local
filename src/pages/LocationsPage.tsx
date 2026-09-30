import { useState, type FormEvent } from 'react'
import { DataTable, type DataTableColumn } from '../components/DataTable'
import { Modal } from '../components/Modal'
import { Stepper } from '../components/Stepper'
import { Pagination, usePagination } from '../components/Pagination'
import { StoreError } from '../data/peopleOpsStore'
import { usePeopleOps } from '../state/PeopleOpsContext'
import type { Location, LocationDraft, Timezone } from '../types'

const timezones: Timezone[] = [
  'Asia/Kolkata',
  'Europe/London',
  'America/New_York',
  'Asia/Singapore',
  'Australia/Sydney',
]

const blank: LocationDraft = { name: '', city: '', timezone: 'Asia/Kolkata', headcountCap: 50 }

export function LocationsPage() {
  const { locations, createLocation, updateLocation, deleteLocation } = usePeopleOps()
  const [draft, setDraft] = useState<LocationDraft>(blank)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const { page, pageCount, pageItems, setPage } = usePagination(locations)

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
      if (editingId) updateLocation(editingId, draft)
      else createLocation(draft)
      close()
    } catch (err) {
      if (err instanceof StoreError) setError(err.message)
      else throw err
    }
  }

  const columns: DataTableColumn<Location>[] = [
    { key: 'name', header: 'Name', sortable: true, render: (row) => row.name },
    { key: 'city', header: 'City', sortable: true, render: (row) => row.city },
    { key: 'timezone', header: 'Timezone', sortable: true, render: (row) => row.timezone },
    {
      key: 'headcountCap',
      header: 'Headcount cap',
      sortable: true,
      sortValue: (row) => row.headcountCap,
      render: (row) => row.headcountCap,
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
          <button type="button" className="btn-link danger" onClick={() => deleteLocation(row.id)}>
            Delete
          </button>
        </>
      ),
    },
  ]

  return (
    <section>
      <div className="page-header">
        <h2>Locations</h2>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            reset()
            setFormOpen(true)
          }}
        >
          + Add location
        </button>
      </div>
      <Modal isOpen={formOpen} title={editingId ? 'Edit location' : 'Add location'} onClose={close}>
        <form aria-label="Location form" onSubmit={submit}>
          <div className="form-grid">
            <label>
              Name
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </label>
            <label>
              City
              <input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
            </label>
            <label>
              Timezone
              <select
                value={draft.timezone}
                onChange={(e) => setDraft({ ...draft, timezone: e.target.value as Timezone })}
              >
                {timezones.map((timezone) => (
                  <option key={timezone} value={timezone}>
                    {timezone}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Headcount cap
              <Stepper
                value={draft.headcountCap}
                onChange={(headcountCap) => setDraft({ ...draft, headcountCap })}
                min={1}
                max={5000}
                step={5}
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
      </Modal>
      <div className="card table-card">
        <DataTable columns={columns} rows={pageItems} emptyMessage="No locations yet." />
      </div>
      <Pagination page={page} pageCount={pageCount} onChange={setPage} />
    </section>
  )
}
