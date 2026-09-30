export interface Department {
  id: string
  name: string
  code: string
}

export type DepartmentDraft = Omit<Department, 'id'>

export interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  /** FK -> Department.id */
  departmentId: string
  /** FK -> OrgUnit.id */
  orgUnitId?: string
}

export type EmployeeDraft = Omit<Employee, 'id'>

export interface Requisition {
  id: string
  positionTitle: string
  jobDescription: string
  salaryOffered: number
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  openFrom: string
  openTo: string
  /** FK -> OrgUnit.id */
  orgUnitId: string
}

export type RequisitionDraft = Omit<Requisition, 'id'>

export interface OrgUnit {
  id: string
  name: string
  /** FK -> OrgUnit.id */
  parentId: string | null
  /** FK -> Employee.id */
  managerId?: string
}

export type OrgUnitDraft = Omit<OrgUnit, 'id'>

export interface Employment {
  id: string
  /** FK -> Employee.id */
  employeeId: string
  isActive: boolean
}

export type EmploymentDraft = Omit<Employment, 'id'>
