import { useState, type FormEvent } from 'react'
import { Pagination, usePagination } from '../components/Pagination'
import { usePeopleOps } from '../state/PeopleOpsContext'
import type { LocationDraft } from '../types'

const blank: LocationDraft = { name: '', headcountCap: 0 }

export function LocationsPage() {
  const { locations, createLocation, updateLocation, deleteLocation } = usePeopleOps()
  const [draft, setDraft] = useState<LocationDraft>(blank)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const { page, pageCount, pageItems, setPage } = usePagination(locations)

  function close() {
    setDraft(blank)
    setEditingId(null)
    setFormOpen(false)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (editingId) updateLocation(editingId, draft)
    else createLocation(draft)
    close()
  }

  return (
    <section>
      <div className="page-header">
        <h2>Locations</h2>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setDraft(blank)
            setEditingId(null)
            setFormOpen(true)
          }}
        >
          + Add location
        </button>
      </div>
      {formOpen && (
        <form aria-label="Location form" className="card form-card" onSubmit={submit}>
          <div className="form-grid">
            <label>
              Name
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </label>
            <label>
              Headcount cap
              <input
                type="number"
                value={draft.headcountCap}
                onChange={(e) => setDraft({ ...draft, headcountCap: Number(e.target.value) })}
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
              <th>Name</th>
              <th>Headcount cap</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.length === 0 && (
              <tr>
                <td className="empty" colSpan={3}>
                  No locations yet.
                </td>
              </tr>
            )}
            {pageItems.map((location) => (
              <tr key={location.id}>
                <td>{location.name}</td>
                <td>{location.headcountCap}</td>
                <td>
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => {
                      setEditingId(location.id)
                      setDraft({ name: location.name, headcountCap: location.headcountCap })
                      setFormOpen(true)
                    }}
                  >
                    Edit
                  </button>
                  <button type="button" className="btn-link danger" onClick={() => deleteLocation(location.id)}>
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
