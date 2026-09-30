import { nextId } from '../lib/id'
import type {
  Department,
  DepartmentDraft,
  Employee,
  EmployeeDraft,
  Employment,
  EmploymentDraft,
  JobRole,
  JobRoleDraft,
  Location,
  LocationDraft,
} from '../types'
import * as repo from './repository'

export interface PeopleOpsState {
  departments: repo.Table<Department>
  employees: repo.Table<Employee>
  jobRoles: repo.Table<JobRole>
  locations: repo.Table<Location>
  employments: repo.Table<Employment>
}

export class StoreError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StoreError'
  }
}

export function emptyState(): PeopleOpsState {
  return { departments: [], employees: [], jobRoles: [], locations: [], employments: [] }
}

/* ---------- Departments ---------- */

export function listDepartments(state: PeopleOpsState): Department[] {
  return repo.list(state.departments)
}

export function getDepartment(state: PeopleOpsState, id: string): Department | undefined {
  return repo.get(state.departments, id)
}

export function createDepartment(state: PeopleOpsState, draft: DepartmentDraft): PeopleOpsState {
  const department: Department = { id: nextId('dep'), ...draft }
  return { ...state, departments: repo.insert(state.departments, department) }
}

export function updateDepartment(
  state: PeopleOpsState,
  id: string,
  patch: Partial<DepartmentDraft>,
): PeopleOpsState {
  requireDepartment(state, id)
  return { ...state, departments: repo.replace(state.departments, id, patch) }
}

export function deleteDepartment(state: PeopleOpsState, id: string): PeopleOpsState {
  requireDepartment(state, id)
  return { ...state, departments: repo.remove(state.departments, id) }
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

export function updateJobRole(
  state: PeopleOpsState,
  id: string,
  patch: Partial<JobRoleDraft>,
): PeopleOpsState {
  requireJobRole(state, id)
  return { ...state, jobRoles: repo.replace(state.jobRoles, id, patch) }
}

export function deleteJobRole(state: PeopleOpsState, id: string): PeopleOpsState {
  requireJobRole(state, id)
  return { ...state, jobRoles: repo.remove(state.jobRoles, id) }
}

/* ---------- Locations ---------- */

export function listLocations(state: PeopleOpsState): Location[] {
  return repo.list(state.locations)
}

export function getLocation(state: PeopleOpsState, id: string): Location | undefined {
  return repo.get(state.locations, id)
}

export function createLocation(state: PeopleOpsState, draft: LocationDraft): PeopleOpsState {
  const location: Location = { id: nextId('loc'), ...draft }
  return { ...state, locations: repo.insert(state.locations, location) }
}

export function updateLocation(
  state: PeopleOpsState,
  id: string,
  patch: Partial<LocationDraft>,
): PeopleOpsState {
  requireLocation(state, id)
  return { ...state, locations: repo.replace(state.locations, id, patch) }
}

export function deleteLocation(state: PeopleOpsState, id: string): PeopleOpsState {
  requireLocation(state, id)
  return { ...state, locations: repo.remove(state.locations, id) }
}

/* ---------- Employments ---------- */

export function listEmployments(state: PeopleOpsState): Employment[] {
  return repo.list(state.employments)
}

export function getEmployment(state: PeopleOpsState, id: string): Employment | undefined {
  return repo.get(state.employments, id)
}

export function createEmployment(state: PeopleOpsState, draft: EmploymentDraft): PeopleOpsState {
  requireEmployee(state, draft.employeeId)
  requireJobRole(state, draft.jobRoleId)
  if (isFutureJoinDate(draft.joinedOn)) {
    throw new StoreError('joinedOn cannot be a future date')
  }
  const location = requireLocation(state, draft.locationId)
  const projectedTotal = activeFteTotalForLocation(state, draft.locationId) + draft.fteAllocation
  if (isEmploymentActive(draft) && projectedTotal > location.headcountCap) {
    throw new StoreError(`Employment would exceed headcount cap for location ${location.name}`)
  }
  const employment: Employment = { id: nextId('emt'), ...draft }
  return { ...state, employments: repo.insert(state.employments, employment) }
}

export function updateEmployment(
  state: PeopleOpsState,
  id: string,
  patch: Partial<EmploymentDraft>,
): PeopleOpsState {
  const existing = requireEmployment(state, id)
  if (patch.employeeId !== undefined) requireEmployee(state, patch.employeeId)
  if (patch.jobRoleId !== undefined) requireJobRole(state, patch.jobRoleId)
  const merged: EmploymentDraft = { ...existing, ...patch }
  if (isFutureJoinDate(merged.joinedOn)) {
    throw new StoreError('joinedOn cannot be a future date')
  }
  const location = requireLocation(state, merged.locationId)
  const projectedTotal = activeFteTotalForLocation(state, merged.locationId, id) + merged.fteAllocation
  if (isEmploymentActive(merged) && projectedTotal > location.headcountCap) {
    throw new StoreError(`Employment would exceed headcount cap for location ${location.name}`)
  }
  return { ...state, employments: repo.replace(state.employments, id, patch) }
}

export function deleteEmployment(state: PeopleOpsState, id: string): PeopleOpsState {
  requireEmployment(state, id)
  return { ...state, employments: repo.remove(state.employments, id) }
}

export function isEmploymentActive(employment: Pick<Employment, 'endDate'>): boolean {
  return employment.endDate === null || employment.endDate === undefined
}

function isFutureJoinDate(joinedOn: string): boolean {
  if (!joinedOn) return false
  const joined = new Date(joinedOn)
  if (Number.isNaN(joined.getTime())) return false
  const today = new Date()
  const todayMidnight = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  const joinedMidnight = Date.UTC(joined.getUTCFullYear(), joined.getUTCMonth(), joined.getUTCDate())
  return joinedMidnight > todayMidnight
}

export function activeFteTotalForLocation(
  state: PeopleOpsState,
  locationId: string,
  excludeEmploymentId?: string,
): number {
  return state.employments
    .filter((employment) => employment.locationId === locationId)
    .filter((employment) => employment.id !== excludeEmploymentId)
    .filter((employment) => isEmploymentActive(employment))
    .reduce((total, employment) => total + employment.fteAllocation, 0)
}

export function listEmployeesWithoutActiveEmployment(
  state: PeopleOpsState,
  excludeEmploymentId?: string,
): Employee[] {
  const activeEmployeeIds = new Set(
    state.employments
      .filter((employment) => employment.id !== excludeEmploymentId)
      .filter((employment) => isEmploymentActive(employment))
      .map((employment) => employment.employeeId),
  )
  return repo.list(state.employees).filter((employee) => !activeEmployeeIds.has(employee.id))
}

/* ---------- FK guards ---------- */

function requireDepartment(state: PeopleOpsState, id: string): Department {
  const department = repo.get(state.departments, id)
  if (!department) throw new StoreError(`No department with id ${id}`)
  return department
}

function requireEmployee(state: PeopleOpsState, id: string): Employee {
  const employee = repo.get(state.employees, id)
  if (!employee) throw new StoreError(`No employee with id ${id}`)
  return employee
}

function requireJobRole(state: PeopleOpsState, id: string): JobRole {
  const jobRole = repo.get(state.jobRoles, id)
  if (!jobRole) throw new StoreError(`No job role with id ${id}`)
  return jobRole
}

function requireLocation(state: PeopleOpsState, id: string): Location {
  const location = repo.get(state.locations, id)
  if (!location) throw new StoreError(`No location with id ${id}`)
  return location
}

function requireEmployment(state: PeopleOpsState, id: string): Employment {
  const employment = repo.get(state.employments, id)
  if (!employment) throw new StoreError(`No employment with id ${id}`)
  return employment
}
