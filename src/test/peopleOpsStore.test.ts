import { describe, expect, it } from 'vitest'
import * as store from '../data/peopleOpsStore'
import { StoreError } from '../data/peopleOpsStore'
import { htmlToPlainText } from '../lib/richText'

const engineering = { name: 'Engineering', code: 'ENG' }
const jane = { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', phone: '555-0100' }

function withDepartment() {
  return store.createDepartment(store.emptyState(), engineering)
}

describe('departments', () => {
  it('seeds exactly one root DIVISION org unit', () => {
    const state = store.emptyState()
    const divisions = store.listOrgUnits(state).filter((unit) => unit.kind === 'DIVISION')
    expect(divisions).toEqual([{ id: 'org_1', name: 'Corporate', kind: 'DIVISION', parentId: null }])
  })

  it('creates, gets and lists', () => {
    const state = withDepartment()
    expect(store.listDepartments(state)).toEqual([{ id: 'org_2', ...engineering }])
    expect(store.getDepartment(state, 'org_2')).toEqual({ id: 'org_2', ...engineering })
    expect(store.getOrgUnit(state, 'org_2')).toMatchObject({ kind: 'DEPARTMENT', parentId: 'org_1' })
  })

  it('updates', () => {
    const state = store.updateDepartment(withDepartment(), 'org_2', { name: 'Platform' })
    expect(store.getDepartment(state, 'org_2')).toEqual({ id: 'org_2', name: 'Platform', code: 'ENG' })
  })

  it('deletes', () => {
    const state = store.deleteDepartment(withDepartment(), 'org_2')
    expect(store.listDepartments(state)).toEqual([])
  })

  it('rejects update and delete of a missing department', () => {
    const state = store.emptyState()
    expect(() => store.updateDepartment(state, 'org_9', { name: 'X' })).toThrow(StoreError)
    expect(() => store.deleteDepartment(state, 'org_9')).toThrow(StoreError)
  })
})

describe('employees', () => {
  it('creates with a valid departmentId', () => {
    const state = store.createEmployee(withDepartment(), { ...jane, departmentId: 'org_2' })
    expect(store.listEmployees(state)).toEqual([{ id: 'emp_1', ...jane, departmentId: 'org_2' }])
  })

  it('rejects create when the department does not exist', () => {
    expect(() => store.createEmployee(store.emptyState(), { ...jane, departmentId: 'org_9' })).toThrow(
      'No department with id org_9',
    )
  })

  it('updates fields and reassigns department', () => {
    let state = store.createDepartment(withDepartment(), { name: 'Sales', code: 'SAL' })
    state = store.createEmployee(state, { ...jane, departmentId: 'org_2' })
    state = store.updateEmployee(state, 'emp_1', { phone: '555-0199', departmentId: 'org_3' })
    expect(store.getEmployee(state, 'emp_1')).toMatchObject({ phone: '555-0199', departmentId: 'org_3' })
  })

  it('rejects reassignment to a missing department', () => {
    const state = store.createEmployee(withDepartment(), { ...jane, departmentId: 'org_2' })
    expect(() => store.updateEmployee(state, 'emp_1', { departmentId: 'org_9' })).toThrow(StoreError)
  })

  it('deletes', () => {
    const state = store.createEmployee(withDepartment(), { ...jane, departmentId: 'org_2' })
    expect(store.listEmployees(store.deleteEmployee(state, 'emp_1'))).toEqual([])
  })

  it('rejects update and delete of a missing employee', () => {
    const state = withDepartment()
    expect(() => store.updateEmployee(state, 'emp_9', { firstName: 'X' })).toThrow(StoreError)
    expect(() => store.deleteEmployee(state, 'emp_9')).toThrow(StoreError)
  })
})

describe('job roles and people managers', () => {
  it('returns only employees linked to a people-manager job role', () => {
    let state = withDepartment()
    state = store.createJobRole(state, { title: 'Engineering Manager', isPeopleManager: true })
    state = store.createJobRole(state, { title: 'Software Engineer', isPeopleManager: false })
    state = store.createEmployee(state, { ...jane, departmentId: 'org_2', jobRoleId: 'role_1' })
    state = store.createEmployee(state, {
      ...jane,
      email: 'john@example.com',
      departmentId: 'org_2',
      jobRoleId: 'role_2',
    })

    const managers = store.listPeopleManagers(state)
    expect(managers).toHaveLength(1)
    expect(managers[0]).toMatchObject({ id: 'emp_1', jobRoleId: 'role_1' })
  })
})

describe('org units', () => {
  // emptyState() already seeds one root DIVISION (org_1); reuse it rather than
  // creating a second top-level division.
  function divisionState() {
    return store.emptyState()
  }

  it('creates a valid DIVISION -> DEPARTMENT -> TEAM chain', () => {
    let state = divisionState()
    state = store.createOrgUnit(state, { name: 'Engineering', kind: 'DEPARTMENT', parentId: 'org_1' })
    state = store.createOrgUnit(state, { name: 'Platform', kind: 'TEAM', parentId: 'org_2' })

    expect(store.getOrgUnit(state, 'org_1')).toMatchObject({ kind: 'DIVISION', parentId: null })
    expect(store.getOrgUnit(state, 'org_2')).toMatchObject({ kind: 'DEPARTMENT', parentId: 'org_1' })
    expect(store.getOrgUnit(state, 'org_3')).toMatchObject({ kind: 'TEAM', parentId: 'org_2' })
    expect(store.listOrgUnits(state)).toHaveLength(3)
  })

  it('rejects a DEPARTMENT whose parent is not a DIVISION', () => {
    const state = divisionState()
    expect(() =>
      store.createOrgUnit(state, { name: 'Bad', kind: 'DEPARTMENT', parentId: null }),
    ).toThrow(StoreError)
  })

  it('rejects a TEAM whose parent is not a DEPARTMENT', () => {
    const state = divisionState()
    expect(() =>
      store.createOrgUnit(state, { name: 'Bad Team', kind: 'TEAM', parentId: 'org_1' }),
    ).toThrow(StoreError)
  })

  it('rejects a DIVISION given a non-null parentId', () => {
    const state = divisionState()
    expect(() =>
      store.createOrgUnit(state, { name: 'Another Division', kind: 'DIVISION', parentId: 'org_1' }),
    ).toThrow(StoreError)
  })
})

describe('requisitions', () => {
  function withTeamAndManager() {
    let state = store.createOrgUnit(store.emptyState(), { name: 'Engineering', kind: 'DEPARTMENT', parentId: 'org_1' })
    state = store.createOrgUnit(state, { name: 'Platform', kind: 'TEAM', parentId: 'org_2' })
    state = store.createJobRole(state, { title: 'Engineering Manager', isPeopleManager: true })
    state = store.createEmployee(state, { ...jane, departmentId: 'org_2', jobRoleId: 'role_1' })
    return state
  }

  const longDescription = `<p>${'a'.repeat(40)}</p>`

  const baseDraft = {
    orgUnitId: 'org_3',
    hiringManagerId: 'emp_1',
    positionTitle: 'Senior Engineer',
    jobDescription: '',
    requiredSkills: [] as const,
    openFrom: '',
    openUntil: '',
    salaryOffered: 100000,
    status: 'DRAFT' as const,
  }

  it('creates a requisition defaulting to DRAFT status', () => {
    const state = store.createRequisition(withTeamAndManager(), { ...baseDraft, requiredSkills: [] })
    expect(store.listRequisitions(state)).toEqual([{ id: 'req_1', ...baseDraft, requiredSkills: [] }])
  })

  it('rejects an orgUnitId that does not resolve to a TEAM', () => {
    const state = withTeamAndManager()
    expect(() =>
      store.createRequisition(state, { ...baseDraft, orgUnitId: 'org_2', requiredSkills: [] }),
    ).toThrow(StoreError)
  })

  it('rejects a hiringManagerId that is not a people manager', () => {
    let state = withTeamAndManager()
    state = store.createJobRole(state, { title: 'Software Engineer', isPeopleManager: false })
    state = store.createEmployee(state, { ...jane, email: 'john@example.com', departmentId: 'org_2', jobRoleId: 'role_2' })
    expect(() =>
      store.createRequisition(state, { ...baseDraft, hiringManagerId: 'emp_2', requiredSkills: [] }),
    ).toThrow(StoreError)
  })

  it('rejects a non-positive salaryOffered', () => {
    const state = withTeamAndManager()
    expect(() =>
      store.createRequisition(state, { ...baseDraft, salaryOffered: 0, requiredSkills: [] }),
    ).toThrow(StoreError)
  })

  it('rejects an unknown skill and dedupes valid ones', () => {
    const state = withTeamAndManager()
    expect(() =>
      // @ts-expect-error deliberately passing an invalid skill for the test
      store.createRequisition(state, { ...baseDraft, requiredSkills: ['NOT_A_SKILL'] }),
    ).toThrow(StoreError)

    const withDuplicates = store.createRequisition(state, {
      ...baseDraft,
      requiredSkills: ['REACT', 'REACT', 'SQL'],
    })
    expect(store.getRequisition(withDuplicates, 'req_1')?.requiredSkills).toEqual(['REACT', 'SQL'])
  })

  it('rejects when openUntil is not after openFrom', () => {
    const state = withTeamAndManager()
    expect(() =>
      store.createRequisition(state, {
        ...baseDraft,
        requiredSkills: [],
        openFrom: '2024-03-02',
        openUntil: '2024-03-01',
      }),
    ).toThrow(StoreError)

    expect(() =>
      store.createRequisition(state, {
        ...baseDraft,
        requiredSkills: [],
        openFrom: '2024-03-01',
        openUntil: '2024-03-01',
      }),
    ).toThrow(StoreError)

    const valid = store.createRequisition(state, {
      ...baseDraft,
      requiredSkills: [],
      openFrom: '2024-03-01',
      openUntil: '2024-03-02',
    })
    expect(store.getRequisition(valid, 'req_1')).toMatchObject({ openFrom: '2024-03-01', openUntil: '2024-03-02' })
  })

  it('rejects a jobDescription under 40 visible characters', () => {
    const state = withTeamAndManager()
    expect(() =>
      store.createRequisition(state, {
        ...baseDraft,
        requiredSkills: [],
        jobDescription: `<p>${'a'.repeat(39)}</p>`,
      }),
    ).toThrow(StoreError)
  })

  it('blocks moving to OPEN without a description, a skill and both dates, but allows the same data as DRAFT', () => {
    const state = withTeamAndManager()

    const draftSaved = store.createRequisition(state, { ...baseDraft, requiredSkills: [], status: 'DRAFT' })
    expect(store.getRequisition(draftSaved, 'req_1')?.status).toBe('DRAFT')

    expect(() =>
      store.createRequisition(state, { ...baseDraft, requiredSkills: [], status: 'OPEN' }),
    ).toThrow(StoreError)

    const complete = store.createRequisition(state, {
      ...baseDraft,
      requiredSkills: ['REACT'],
      jobDescription: longDescription,
      openFrom: '2024-03-01',
      openUntil: '2024-03-02',
      status: 'OPEN',
    })
    expect(store.getRequisition(complete, 'req_2')?.status).toBe('OPEN')
  })

  it('updates and deletes', () => {
    let state = withTeamAndManager()
    state = store.createRequisition(state, {
      ...baseDraft,
      requiredSkills: ['REACT'],
      jobDescription: longDescription,
      openFrom: '2024-03-01',
      openUntil: '2024-03-02',
    })
    state = store.updateRequisition(state, 'req_1', { positionTitle: 'Staff Engineer' })
    expect(store.getRequisition(state, 'req_1')).toMatchObject({ positionTitle: 'Staff Engineer' })

    state = store.deleteRequisition(state, 'req_1')
    expect(store.listRequisitions(state)).toEqual([])
  })

  it('rejects update and delete of a missing requisition', () => {
    const state = withTeamAndManager()
    expect(() => store.updateRequisition(state, 'req_9', { positionTitle: 'X' })).toThrow(StoreError)
    expect(() => store.deleteRequisition(state, 'req_9')).toThrow(StoreError)
  })
})

describe('htmlToPlainText', () => {
  it('treats a 39-visible-character HTML string as too short', () => {
    const html = `<p>${'a'.repeat(39)}</p>`
    expect(htmlToPlainText(html).length).toBeLessThan(40)
  })

  it('treats a 40-visible-character HTML string as long enough', () => {
    const html = `<p>${'a'.repeat(40)}</p>`
    expect(htmlToPlainText(html).length).toBeGreaterThanOrEqual(40)
  })

  it('strips tags and decodes entities', () => {
    expect(htmlToPlainText('<p>Hi&nbsp;there</p>')).toBe('Hi there')
  })
})
