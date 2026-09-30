import { nextId } from '../lib/id'
import type {
  Department,
  DepartmentDraft,
  Employee,
  EmployeeDraft,
  Employment,
  EmploymentDraft,
  OrgUnit,
  OrgUnitDraft,
  Requisition,
  RequisitionDraft,
} from '../types'
import * as repo from './repository'

export interface PeopleOpsState {
  departments: repo.Table<Department>
  employees: repo.Table<Employee>
  requisitions: repo.Table<Requisition>
  orgUnits: repo.Table<OrgUnit>
  employments: repo.Table<Employment>
}

export class StoreError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StoreError'
  }
}

export function emptyState(): PeopleOpsState {
  return { departments: [], employees: [], requisitions: [], orgUnits: [], employments: [] }
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

/* ---------- Requisitions ---------- */

export function listRequisitions(state: PeopleOpsState): Requisition[] {
  return repo.list(state.requisitions)
}

export function getRequisition(state: PeopleOpsState, id: string): Requisition | undefined {
  return repo.get(state.requisitions, id)
}

export function createRequisition(state: PeopleOpsState, draft: RequisitionDraft): PeopleOpsState {
  requireOrgUnit(state, draft.orgUnitId)
  const requisition: Requisition = { id: nextId('req'), ...draft }
  return { ...state, requisitions: repo.insert(state.requisitions, requisition) }
}

export function updateRequisition(
  state: PeopleOpsState,
  id: string,
  patch: Partial<RequisitionDraft>,
): PeopleOpsState {
  requireRequisition(state, id)
  if (patch.orgUnitId !== undefined) requireOrgUnit(state, patch.orgUnitId)
  return { ...state, requisitions: repo.replace(state.requisitions, id, patch) }
}

export function deleteRequisition(state: PeopleOpsState, id: string): PeopleOpsState {
  requireRequisition(state, id)
  return { ...state, requisitions: repo.remove(state.requisitions, id) }
}

/* ---------- Org units ---------- */

export function listOrgUnits(state: PeopleOpsState): OrgUnit[] {
  return repo.list(state.orgUnits)
}

export function getOrgUnit(state: PeopleOpsState, id: string): OrgUnit | undefined {
  return repo.get(state.orgUnits, id)
}

export function createOrgUnit(state: PeopleOpsState, draft: OrgUnitDraft): PeopleOpsState {
  if (draft.parentId !== null) requireOrgUnit(state, draft.parentId)
  if (draft.managerId !== undefined) requireEmployee(state, draft.managerId)
  const orgUnit: OrgUnit = { id: nextId('org'), ...draft }
  return { ...state, orgUnits: repo.insert(state.orgUnits, orgUnit) }
}

export function updateOrgUnit(
  state: PeopleOpsState,
  id: string,
  patch: Partial<OrgUnitDraft>,
): PeopleOpsState {
  requireOrgUnit(state, id)
  if (patch.parentId !== undefined && patch.parentId !== null) requireOrgUnit(state, patch.parentId)
  if (patch.managerId !== undefined) requireEmployee(state, patch.managerId)
  return { ...state, orgUnits: repo.replace(state.orgUnits, id, patch) }
}

export function deleteOrgUnit(state: PeopleOpsState, id: string): PeopleOpsState {
  requireOrgUnit(state, id)
  return { ...state, orgUnits: repo.remove(state.orgUnits, id) }
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
  const employment: Employment = { id: nextId('emt'), ...draft }
  return { ...state, employments: repo.insert(state.employments, employment) }
}

export function updateEmployment(
  state: PeopleOpsState,
  id: string,
  patch: Partial<EmploymentDraft>,
): PeopleOpsState {
  requireEmployment(state, id)
  if (patch.employeeId !== undefined) requireEmployee(state, patch.employeeId)
  return { ...state, employments: repo.replace(state.employments, id, patch) }
}

export function deleteEmployment(state: PeopleOpsState, id: string): PeopleOpsState {
  requireEmployment(state, id)
  return { ...state, employments: repo.remove(state.employments, id) }
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

function requireRequisition(state: PeopleOpsState, id: string): Requisition {
  const requisition = repo.get(state.requisitions, id)
  if (!requisition) throw new StoreError(`No requisition with id ${id}`)
  return requisition
}

function requireOrgUnit(state: PeopleOpsState, id: string): OrgUnit {
  const orgUnit = repo.get(state.orgUnits, id)
  if (!orgUnit) throw new StoreError(`No org unit with id ${id}`)
  return orgUnit
}

function requireEmployment(state: PeopleOpsState, id: string): Employment {
  const employment = repo.get(state.employments, id)
  if (!employment) throw new StoreError(`No employment with id ${id}`)
  return employment
}
