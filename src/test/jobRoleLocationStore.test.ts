import { describe, expect, it } from 'vitest'
import * as store from '../data/peopleOpsStore'
import { StoreError } from '../data/peopleOpsStore'

const baseRole = { title: 'Engineer', level: 'MID' as const, baseSalary: 500000, isPeopleManager: false }

describe('job roles', () => {
  it('creates, gets and lists', () => {
    const state = store.createJobRole(store.emptyState(), baseRole)
    expect(store.listJobRoles(state)).toEqual([{ id: 'role_1', ...baseRole }])
    expect(store.getJobRole(state, 'role_1')).toEqual({ id: 'role_1', ...baseRole })
  })

  it('allows the same title in different levels', () => {
    let state = store.createJobRole(store.emptyState(), baseRole)
    state = store.createJobRole(state, { ...baseRole, level: 'SENIOR' })
    expect(store.listJobRoles(state)).toHaveLength(2)
  })

  it('rejects a duplicate title within the same level regardless of case or surrounding whitespace', () => {
    const state = store.createJobRole(store.emptyState(), baseRole)
    expect(() => store.createJobRole(state, { ...baseRole, title: '  engineer  ' })).toThrow(StoreError)
  })

  it('allows updating a job role title to itself within the same level', () => {
    const state = store.createJobRole(store.emptyState(), baseRole)
    expect(() => store.updateJobRole(state, 'role_1', { title: 'Engineer' })).not.toThrow()
  })

  it('rejects createJobRole when baseSalary is zero or negative', () => {
    expect(() => store.createJobRole(store.emptyState(), { ...baseRole, baseSalary: 0 })).toThrow(StoreError)
    expect(() => store.createJobRole(store.emptyState(), { ...baseRole, baseSalary: -100 })).toThrow(StoreError)
  })

  it('rejects updateJobRole when baseSalary is zero or negative', () => {
    const state = store.createJobRole(store.emptyState(), baseRole)
    expect(() => store.updateJobRole(state, 'role_1', { baseSalary: 0 })).toThrow(StoreError)
  })

  it('deletes unconditionally', () => {
    const state = store.createJobRole(store.emptyState(), baseRole)
    expect(store.listJobRoles(store.deleteJobRole(state, 'role_1'))).toEqual([])
  })

  it('rejects update and delete of a missing job role', () => {
    const state = store.emptyState()
    expect(() => store.updateJobRole(state, 'role_9', { title: 'X' })).toThrow(StoreError)
    expect(() => store.deleteJobRole(state, 'role_9')).toThrow(StoreError)
  })
})

const baseLocation = { name: 'Bengaluru HQ', city: 'Bengaluru', timezone: 'Asia/Kolkata' as const, headcountCap: 50 }

describe('locations', () => {
  it('creates, gets and lists', () => {
    const state = store.createLocation(store.emptyState(), baseLocation)
    expect(store.listLocations(state)).toEqual([{ id: 'loc_1', ...baseLocation }])
    expect(store.getLocation(state, 'loc_1')).toEqual({ id: 'loc_1', ...baseLocation })
  })

  it('updates', () => {
    const state = store.updateLocation(
      store.createLocation(store.emptyState(), baseLocation),
      'loc_1',
      { headcountCap: 100 },
    )
    expect(store.getLocation(state, 'loc_1')).toMatchObject({ headcountCap: 100 })
  })

  it('deletes unconditionally', () => {
    const state = store.createLocation(store.emptyState(), baseLocation)
    expect(store.listLocations(store.deleteLocation(state, 'loc_1'))).toEqual([])
  })

  it('rejects update and delete of a missing location', () => {
    const state = store.emptyState()
    expect(() => store.updateLocation(state, 'loc_9', { name: 'X' })).toThrow(StoreError)
    expect(() => store.deleteLocation(state, 'loc_9')).toThrow(StoreError)
  })
})
