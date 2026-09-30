import { describe, expect, it } from 'vitest'
import * as store from '../data/peopleOpsStore'
import { StoreError } from '../data/peopleOpsStore'

const engineering = { name: 'Engineering', code: 'ENG' }
const jane = { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', phone: '555-0100' }

function withDepartment() {
  return store.createDepartment(store.emptyState(), engineering)
}

describe('departments', () => {
  it('creates, gets and lists', () => {
    const state = withDepartment()
    expect(store.listDepartments(state)).toEqual([{ id: 'dep_1', ...engineering }])
    expect(store.getDepartment(state, 'dep_1')).toEqual({ id: 'dep_1', ...engineering })
  })

  it('updates', () => {
    const state = store.updateDepartment(withDepartment(), 'dep_1', { name: 'Platform' })
    expect(store.getDepartment(state, 'dep_1')).toEqual({ id: 'dep_1', name: 'Platform', code: 'ENG' })
  })

  it('deletes', () => {
    const state = store.deleteDepartment(withDepartment(), 'dep_1')
    expect(store.listDepartments(state)).toEqual([])
  })

  it('rejects update and delete of a missing department', () => {
    const state = store.emptyState()
    expect(() => store.updateDepartment(state, 'dep_9', { name: 'X' })).toThrow(StoreError)
    expect(() => store.deleteDepartment(state, 'dep_9')).toThrow(StoreError)
  })
})

describe('employees', () => {
  it('creates with a valid departmentId', () => {
    const state = store.createEmployee(withDepartment(), { ...jane, departmentId: 'dep_1' })
    expect(store.listEmployees(state)).toEqual([{ id: 'emp_1', ...jane, departmentId: 'dep_1' }])
  })

  it('rejects create when the department does not exist', () => {
    expect(() => store.createEmployee(store.emptyState(), { ...jane, departmentId: 'dep_9' })).toThrow(
      'No department with id dep_9',
    )
  })

  it('updates fields and reassigns department', () => {
    let state = store.createDepartment(withDepartment(), { name: 'Sales', code: 'SAL' })
    state = store.createEmployee(state, { ...jane, departmentId: 'dep_1' })
    state = store.updateEmployee(state, 'emp_1', { phone: '555-0199', departmentId: 'dep_2' })
    expect(store.getEmployee(state, 'emp_1')).toMatchObject({ phone: '555-0199', departmentId: 'dep_2' })
  })

  it('rejects reassignment to a missing department', () => {
    const state = store.createEmployee(withDepartment(), { ...jane, departmentId: 'dep_1' })
    expect(() => store.updateEmployee(state, 'emp_1', { departmentId: 'dep_9' })).toThrow(StoreError)
  })

  it('deletes', () => {
    const state = store.createEmployee(withDepartment(), { ...jane, departmentId: 'dep_1' })
    expect(store.listEmployees(store.deleteEmployee(state, 'emp_1'))).toEqual([])
  })

  it('rejects update and delete of a missing employee', () => {
    const state = withDepartment()
    expect(() => store.updateEmployee(state, 'emp_9', { firstName: 'X' })).toThrow(StoreError)
    expect(() => store.deleteEmployee(state, 'emp_9')).toThrow(StoreError)
  })
})

const engineer = { title: 'Engineer', isPeopleManager: false }
const office = { name: 'HQ', headcountCap: 10 }

describe('job roles', () => {
  it('creates, gets and lists', () => {
    const state = store.createJobRole(store.emptyState(), engineer)
    expect(store.listJobRoles(state)).toEqual([{ id: 'role_1', ...engineer }])
    expect(store.getJobRole(state, 'role_1')).toEqual({ id: 'role_1', ...engineer })
  })

  it('updates', () => {
    const state = store.updateJobRole(store.createJobRole(store.emptyState(), engineer), 'role_1', {
      title: 'Senior Engineer',
    })
    expect(store.getJobRole(state, 'role_1')).toEqual({ id: 'role_1', title: 'Senior Engineer', isPeopleManager: false })
  })

  it('deletes', () => {
    const state = store.deleteJobRole(store.createJobRole(store.emptyState(), engineer), 'role_1')
    expect(store.listJobRoles(state)).toEqual([])
  })

  it('rejects update and delete of a missing job role', () => {
    const state = store.emptyState()
    expect(() => store.updateJobRole(state, 'role_9', { title: 'X' })).toThrow(StoreError)
    expect(() => store.deleteJobRole(state, 'role_9')).toThrow(StoreError)
  })
})

describe('locations', () => {
  it('creates, gets and lists', () => {
    const state = store.createLocation(store.emptyState(), office)
    expect(store.listLocations(state)).toEqual([{ id: 'loc_1', ...office }])
    expect(store.getLocation(state, 'loc_1')).toEqual({ id: 'loc_1', ...office })
  })

  it('updates', () => {
    const state = store.updateLocation(store.createLocation(store.emptyState(), office), 'loc_1', {
      headcountCap: 20,
    })
    expect(store.getLocation(state, 'loc_1')).toEqual({ id: 'loc_1', name: 'HQ', headcountCap: 20 })
  })

  it('deletes', () => {
    const state = store.deleteLocation(store.createLocation(store.emptyState(), office), 'loc_1')
    expect(store.listLocations(state)).toEqual([])
  })

  it('rejects update and delete of a missing location', () => {
    const state = store.emptyState()
    expect(() => store.updateLocation(state, 'loc_9', { name: 'X' })).toThrow(StoreError)
    expect(() => store.deleteLocation(state, 'loc_9')).toThrow(StoreError)
  })
})

const jack = { firstName: 'Jack', lastName: 'Smith', email: 'jack@example.com', phone: '555-0200' }

function withEmploymentFixtures() {
  let state = store.createDepartment(store.emptyState(), engineering)
  state = store.createEmployee(state, { ...jane, departmentId: 'dep_1' })
  state = store.createEmployee(state, { ...jack, departmentId: 'dep_1' })
  state = store.createJobRole(state, engineer)
  state = store.createLocation(state, office)
  return state
}

function employmentDraft(overrides: Partial<Parameters<typeof store.createEmployment>[1]> = {}) {
  return {
    employeeId: 'emp_1',
    jobRoleId: 'role_1',
    locationId: 'loc_1',
    employmentType: 'FULL_TIME' as const,
    noticePeriodDays: 30,
    weeklyHours: 40,
    fteAllocation: 100,
    joinedOn: '2020-01-01',
    endDate: null,
    ...overrides,
  }
}

describe('employments', () => {
  it('creates with valid FKs', () => {
    // office.headcountCap is 10, so keep this employment's fteAllocation within it.
    const draft = employmentDraft({ fteAllocation: 10 })
    const state = store.createEmployment(withEmploymentFixtures(), draft)
    expect(store.listEmployments(state)).toEqual([{ id: 'emt_1', ...draft }])
  })

  it('rejects create when employeeId, jobRoleId or locationId does not exist', () => {
    const state = withEmploymentFixtures()
    expect(() => store.createEmployment(state, employmentDraft({ employeeId: 'emp_9' }))).toThrow(StoreError)
    expect(() => store.createEmployment(state, employmentDraft({ jobRoleId: 'role_9' }))).toThrow(StoreError)
    expect(() => store.createEmployment(state, employmentDraft({ locationId: 'loc_9' }))).toThrow(StoreError)
  })

  it('rejects an employment that would exceed the location headcount cap', () => {
    // office.headcountCap is 10; a single FULL_TIME (100%) employment already exceeds it.
    const state = withEmploymentFixtures()
    expect(() => store.createEmployment(state, employmentDraft())).toThrow(
      'Employment would exceed headcount cap for location HQ',
    )
  })

  it('allows an employment that keeps the active total at or under the headcount cap', () => {
    let state = store.createLocation(withEmploymentFixtures(), { name: 'Annex', headcountCap: 100 })
    state = store.createEmployment(state, employmentDraft({ locationId: 'loc_2', fteAllocation: 100 }))
    expect(store.listEmployments(state)).toHaveLength(1)
  })

  it('excludes the record being updated from its own cap calculation', () => {
    let state = store.createLocation(withEmploymentFixtures(), { name: 'Annex', headcountCap: 100 })
    state = store.createEmployment(state, employmentDraft({ locationId: 'loc_2', fteAllocation: 100 }))
    // Re-saving the same employment with the same fteAllocation must not double-count itself.
    state = store.updateEmployment(state, 'emt_1', { fteAllocation: 100 })
    expect(store.getEmployment(state, 'emt_1')).toMatchObject({ fteAllocation: 100 })
  })

  it('deletes', () => {
    let state = store.createLocation(withEmploymentFixtures(), { name: 'Annex', headcountCap: 100 })
    state = store.createEmployment(state, employmentDraft({ locationId: 'loc_2' }))
    expect(store.listEmployments(store.deleteEmployment(state, 'emt_1'))).toEqual([])
  })

  it('rejects update and delete of a missing employment', () => {
    const state = withEmploymentFixtures()
    expect(() => store.updateEmployment(state, 'emt_9', { noticePeriodDays: 15 })).toThrow(StoreError)
    expect(() => store.deleteEmployment(state, 'emt_9')).toThrow(StoreError)
  })

  it('lists only employees with no active employment', () => {
    let state = store.createLocation(withEmploymentFixtures(), { name: 'Annex', headcountCap: 100 })
    state = store.createEmployment(state, employmentDraft({ locationId: 'loc_2' }))
    const remaining = store.listEmployeesWithoutActiveEmployment(state)
    expect(remaining.map((employee) => employee.id)).toEqual(['emp_2'])
  })
})
