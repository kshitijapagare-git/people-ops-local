export interface Department {
  id: string
  name: string
  code: string
}

export type DepartmentDraft = Omit<Department, 'id'>

export type OrgUnitKind = 'DIVISION' | 'DEPARTMENT' | 'TEAM'

export interface OrgUnit {
  id: string
  name: string
  kind: OrgUnitKind
  /** FK -> OrgUnit.id. null only for the root DIVISION. */
  parentId: string | null
  /** Only meaningful for kind DEPARTMENT; preserves the legacy Department.code. */
  code?: string
}

export type OrgUnitDraft = Omit<OrgUnit, 'id'>

export interface JobRole {
  id: string
  title: string
  isPeopleManager: boolean
}

export type JobRoleDraft = Omit<JobRole, 'id'>

export interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  /** FK -> OrgUnit.id (kind DEPARTMENT) */
  departmentId: string
  /** FK -> JobRole.id */
  jobRoleId?: string
}

export type EmployeeDraft = Omit<Employee, 'id'>

export type SkillTag = 'REACT' | 'TYPESCRIPT' | 'PYTHON' | 'SQL' | 'DEVOPS' | 'DESIGN' | 'QA'

export type RequisitionStatus = 'DRAFT' | 'OPEN' | 'ON_HOLD' | 'FILLED' | 'CANCELLED'

export interface Requisition {
  id: string
  /** FK -> OrgUnit.id (kind TEAM) */
  orgUnitId: string
  /** FK -> Employee.id (must be a people manager) */
  hiringManagerId: string
  positionTitle: string
  /** Raw HTML from the RichTextEditor. */
  jobDescription: string
  requiredSkills: SkillTag[]
  /** Local YYYY-MM-DD string. */
  openFrom: string
  /** Local YYYY-MM-DD string. */
  openUntil: string
  salaryOffered: number
  status: RequisitionStatus
}

export type RequisitionDraft = Omit<Requisition, 'id' | 'status'> & { status?: RequisitionStatus }
