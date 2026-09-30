import { isAfterDateString } from '../lib/date'
import { nextId } from '../lib/id'
import { htmlToPlainText } from '../lib/richText'
import type {
  Department,
  DepartmentDraft,
  Employee,
  EmployeeDraft,
  JobRole,
  JobRoleDraft,
  OrgUnit,
  OrgUnitDraft,
  Requisition,
  RequisitionDraft,
  SkillTag,
} from '../types'
import * as repo from './repository'

export interface PeopleOpsState {
  employees: repo.Table<Employee>
  orgUnits: repo.Table<OrgUnit>
  jobRoles: repo.Table<JobRole>
  requisitions: repo.Table<Requisition>
}

export class StoreError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StoreError'
  }
}

export function emptyState(): PeopleOpsState {
  const division: OrgUnit = { id: nextId('org'), name: 'Corporate', kind: 'DIVISION', parentId: null }
  return { employees: [], orgUnits: [division], jobRoles: [], requisitions: [] }
}

/* ---------- Departments (backed by OrgUnit rows of kind DEPARTMENT) ---------- */

function toDepartment(orgUnit: OrgUnit): Department {
  return { id: orgUnit.id, name: orgUnit.name, code: orgUnit.code ?? '' }
}

function rootDivision(state: PeopleOpsState): OrgUnit {
  const division = state.orgUnits.find((unit) => unit.kind === 'DIVISION' && unit.parentId === null)
  if (!division) throw new StoreError('No root division exists to attach a department to')
  return division
}

export function listDepartments(state: PeopleOpsState): Department[] {
  return state.orgUnits.filter((unit) => unit.kind === 'DEPARTMENT').map(toDepartment)
}

export function getDepartment(state: PeopleOpsState, id: string): Department | undefined {
  const unit = repo.get(state.orgUnits, id)
  if (!unit || unit.kind !== 'DEPARTMENT') return undefined
  return toDepartment(unit)
}

export function createDepartment(state: PeopleOpsState, draft: DepartmentDraft): PeopleOpsState {
  const division = rootDivision(state)
  return createOrgUnit(state, { name: draft.name, kind: 'DEPARTMENT', parentId: division.id, code: draft.code })
}

export function updateDepartment(
  state: PeopleOpsState,
  id: string,
  patch: Partial<DepartmentDraft>,
): PeopleOpsState {
  requireDepartment(state, id)
  return { ...state, orgUnits: repo.replace(state.orgUnits, id, patch) }
}

export function deleteDepartment(state: PeopleOpsState, id: string): PeopleOpsState {
  requireDepartment(state, id)
  return { ...state, orgUnits: repo.remove(state.orgUnits, id) }
}

/* ---------- Employees ---------- */

export function listEmployees(state: PeopleOpsState): Employee[] {
  return repo.list(state.employees)
}

export function getEmployee(state: PeopleOpsState, id: string): Employee | undefined {
  return repo.get(state.employees, id)
}

export function createEmployee(state: PeopleOpsState, draft: EmployeeDraft): PeopleOpsState {
  requireDepartment(state, draft.departmentId)
  const employee: Employee = { id: nextId('emp'), ...draft }
  return { ...state, employees: repo.insert(state.employees, employee) }
}

export function updateEmployee(
  state: PeopleOpsState,
  id: string,
  patch: Partial<EmployeeDraft>,
): PeopleOpsState {
  requireEmployee(state, id)
  if (patch.departmentId !== undefined) requireDepartment(state, patch.departmentId)
  return { ...state, employees: repo.replace(state.employees, id, patch) }
}

export function deleteEmployee(state: PeopleOpsState, id: string): PeopleOpsState {
  requireEmployee(state, id)
  return { ...state, employees: repo.remove(state.employees, id) }
}

/* ---------- Org units ---------- */

export function listOrgUnits(state: PeopleOpsState): OrgUnit[] {
  return repo.list(state.orgUnits)
}

export function getOrgUnit(state: PeopleOpsState, id: string): OrgUnit | undefined {
  return repo.get(state.orgUnits, id)
}

export function createOrgUnit(state: PeopleOpsState, draft: OrgUnitDraft): PeopleOpsState {
  validateOrgUnitParent(state, draft.kind, draft.parentId)
  const orgUnit: OrgUnit = { id: nextId('org'), ...draft }
  return { ...state, orgUnits: repo.insert(state.orgUnits, orgUnit) }
}

export function updateOrgUnit(
  state: PeopleOpsState,
  id: string,
  patch: Partial<OrgUnitDraft>,
): PeopleOpsState {
  const existing = requireOrgUnit(state, id)
  if (patch.kind !== undefined || patch.parentId !== undefined) {
    const kind = patch.kind ?? existing.kind
    const parentId = patch.parentId !== undefined ? patch.parentId : existing.parentId
    validateOrgUnitParent(state, kind, parentId)
  }
  return { ...state, orgUnits: repo.replace(state.orgUnits, id, patch) }
}

export function deleteOrgUnit(state: PeopleOpsState, id: string): PeopleOpsState {
  requireOrgUnit(state, id)
  return { ...state, orgUnits: repo.remove(state.orgUnits, id) }
}

function validateOrgUnitParent(state: PeopleOpsState, kind: OrgUnit['kind'], parentId: string | null): void {
  if (kind === 'DIVISION') {
    if (parentId !== null) throw new StoreError('A DIVISION must not have a parent')
    return
  }
  if (parentId === null) {
    throw new StoreError(`A ${kind} must have a parent`)
  }
  const parent = repo.get(state.orgUnits, parentId)
  if (!parent) throw new StoreError(`No org unit with id ${parentId}`)
  if (kind === 'DEPARTMENT' && parent.kind !== 'DIVISION') {
    throw new StoreError('A DEPARTMENT must have a DIVISION parent')
  }
  if (kind === 'TEAM' && parent.kind !== 'DEPARTMENT') {
    throw new StoreError('A TEAM must have a DEPARTMENT parent')
  }
}

/* ---------- Job roles ---------- */

export function listJobRoles(state: PeopleOpsState): JobRole[] {
  return repo.list(state.jobRoles)
}

export function getJobRole(state: PeopleOpsState, id: string): JobRole | undefined {
  return repo.get(state.jobRoles, id)
}

export function createJobRole(state: PeopleOpsState, draft: JobRoleDraft): PeopleOpsState {
  const jobRole: JobRole = { id: nextId('role'), ...draft }
  return { ...state, jobRoles: repo.insert(state.jobRoles, jobRole) }
}

export function listPeopleManagers(state: PeopleOpsState): Employee[] {
  return repo.list(state.employees).filter((employee) => {
    if (!employee.jobRoleId) return false
    const jobRole = repo.get(state.jobRoles, employee.jobRoleId)
    return jobRole?.isPeopleManager === true
  })
}

/* ---------- Requisitions ---------- */

const SKILL_TAGS: readonly SkillTag[] = ['REACT', 'TYPESCRIPT', 'PYTHON', 'SQL', 'DEVOPS', 'DESIGN', 'QA']

export function listRequisitions(state: PeopleOpsState): Requisition[] {
  return repo.list(state.requisitions)
}

export function getRequisition(state: PeopleOpsState, id: string): Requisition | undefined {
  return repo.get(state.requisitions, id)
}

export function createRequisition(state: PeopleOpsState, draft: RequisitionDraft): PeopleOpsState {
  const candidate: Requisition = { id: '', ...draft, status: draft.status ?? 'DRAFT' }
  validateRequisition(state, candidate)
  const requisition: Requisition = { ...candidate, id: nextId('req') }
  return { ...state, requisitions: repo.insert(state.requisitions, requisition) }
}

export function updateRequisition(
  state: PeopleOpsState,
  id: string,
  patch: Partial<RequisitionDraft>,
): PeopleOpsState {
  const existing = requireRequisition(state, id)
  const merged: Requisition = { ...existing, ...patch }
  validateRequisition(state, merged)
  const normalizedPatch = patch.requiredSkills !== undefined
    ? { ...patch, requiredSkills: merged.requiredSkills }
    : patch
  return { ...state, requisitions: repo.replace(state.requisitions, id, normalizedPatch) }
}

export function deleteRequisition(state: PeopleOpsState, id: string): PeopleOpsState {
  requireRequisition(state, id)
  return { ...state, requisitions: repo.remove(state.requisitions, id) }
}

function validateRequisition(state: PeopleOpsState, requisition: Requisition): void {
  const orgUnit = repo.get(state.orgUnits, requisition.orgUnitId)
  if (!orgUnit || orgUnit.kind !== 'TEAM') {
    throw new StoreError(`No TEAM org unit with id ${requisition.orgUnitId}`)
  }

  const isPeopleManager = listPeopleManagers(state).some(
    (employee) => employee.id === requisition.hiringManagerId,
  )
  if (!isPeopleManager) {
    throw new StoreError(`No people-manager employee with id ${requisition.hiringManagerId}`)
  }

  if (requisition.salaryOffered <= 0) {
    throw new StoreError('salaryOffered must be greater than zero')
  }

  const uniqueSkills = new Set(requisition.requiredSkills)
  for (const skill of uniqueSkills) {
    if (!SKILL_TAGS.includes(skill)) {
      throw new StoreError(`Unknown required skill: ${skill}`)
    }
  }
  requisition.requiredSkills = [...uniqueSkills]

  if (requisition.openFrom && requisition.openUntil) {
    if (!isAfterDateString(requisition.openUntil, requisition.openFrom)) {
      throw new StoreError('openUntil must be after openFrom')
    }
  }

  if (requisition.jobDescription && htmlToPlainText(requisition.jobDescription).length < 40) {
    throw new StoreError('jobDescription must contain at least 40 characters of text content')
  }

  if (requisition.status === 'OPEN') {
    const hasDescription = htmlToPlainText(requisition.jobDescription).length > 0
    const hasSkill = requisition.requiredSkills.length > 0
    const hasDates = Boolean(requisition.openFrom) && Boolean(requisition.openUntil)
    if (!hasDescription || !hasSkill || !hasDates) {
      throw new StoreError(
        'A requisition requires a job description, at least one skill and both dates before it can be OPEN',
      )
    }
  }
}

function requireRequisition(state: PeopleOpsState, id: string): Requisition {
  const requisition = repo.get(state.requisitions, id)
  if (!requisition) throw new StoreError(`No requisition with id ${id}`)
  return requisition
}

/* ---------- FK guards ---------- */

function requireDepartment(state: PeopleOpsState, id: string): Department {
  const unit = repo.get(state.orgUnits, id)
  if (!unit || unit.kind !== 'DEPARTMENT') throw new StoreError(`No department with id ${id}`)
  return toDepartment(unit)
}

function requireEmployee(state: PeopleOpsState, id: string): Employee {
  const employee = repo.get(state.employees, id)
  if (!employee) throw new StoreError(`No employee with id ${id}`)
  return employee
}

function requireOrgUnit(state: PeopleOpsState, id: string): OrgUnit {
  const orgUnit = repo.get(state.orgUnits, id)
  if (!orgUnit) throw new StoreError(`No org unit with id ${id}`)
  return orgUnit
}
