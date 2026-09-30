import { nextId } from '../lib/id'
import type {
  Department,
  DepartmentDraft,
  Employee,
  EmployeeDraft,
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
}

export class StoreError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StoreError'
  }
}

export function emptyState(): PeopleOpsState {
  return { departments: [], employees: [], jobRoles: [], locations: [] }
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
  requireValidBaseSalary(draft.baseSalary)
  requireUniqueJobRoleTitle(state, draft.title, draft.level)
  const jobRole: JobRole = { id: nextId('role'), ...draft }
  return { ...state, jobRoles: repo.insert(state.jobRoles, jobRole) }
}

export function updateJobRole(
  state: PeopleOpsState,
  id: string,
  patch: Partial<JobRoleDraft>,
): PeopleOpsState {
  const existing = requireJobRole(state, id)
  if (patch.baseSalary !== undefined) requireValidBaseSalary(patch.baseSalary)
  const title = patch.title !== undefined ? patch.title : existing.title
  const level = patch.level !== undefined ? patch.level : existing.level
  requireUniqueJobRoleTitle(state, title, level, id)
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

/* ---------- Validation ---------- */

function requireValidBaseSalary(baseSalary: number): void {
  if (baseSalary <= 0) throw new StoreError('Base salary must be greater than zero')
}

function requireUniqueJobRoleTitle(
  state: PeopleOpsState,
  title: string,
  level: JobRole['level'],
  excludeId?: string,
): void {
  const normalized = title.trim().toLowerCase()
  const duplicate = state.jobRoles.find(
    (jobRole) =>
      jobRole.id !== excludeId &&
      jobRole.level === level &&
      jobRole.title.trim().toLowerCase() === normalized,
  )
  if (duplicate) throw new StoreError(`A job role titled "${title.trim()}" already exists for level ${level}`)
}
