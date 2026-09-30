export interface Department {
  id: string
  name: string
  code: string
}

export type DepartmentDraft = Omit<Department, 'id'>

export interface JobRole {
  id: string
  title: string
  isPeopleManager: boolean
}

export type JobRoleDraft = Omit<JobRole, 'id'>

export interface Location {
  id: string
  name: string
  headcountCap: number
}

export type LocationDraft = Omit<Location, 'id'>

export interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  /** FK -> Department.id */
  departmentId: string
}

export type EmployeeDraft = Omit<Employee, 'id'>

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN'

export interface Employment {
  id: string
  /** FK -> Employee.id */
  employeeId: string
  /** FK -> JobRole.id */
  jobRoleId: string
  /** FK -> Location.id */
  locationId: string
  employmentType: EmploymentType
  noticePeriodDays: number
  weeklyHours: number
  fteAllocation: number
  probationRating?: number
  joinedOn: string
  /** null/undefined means the employment is active */
  endDate?: string | null
}

export type EmploymentDraft = Omit<Employment, 'id'>
