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
}

export type EmployeeDraft = Omit<Employee, 'id'>

export type JobRoleLevel = 'INTERN' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'PRINCIPAL'

export interface JobRole {
  id: string
  title: string
  level: JobRoleLevel
  /** Whole-number minor units (e.g. cents); no floating-point currency. */
  baseSalary: number
  isPeopleManager: boolean
}

export type JobRoleDraft = Omit<JobRole, 'id'>

export type Timezone = 'Asia/Kolkata' | 'Europe/London' | 'America/New_York' | 'Asia/Singapore' | 'Australia/Sydney'

export interface Location {
  id: string
  name: string
  city: string
  timezone: Timezone
  headcountCap: number
}

export type LocationDraft = Omit<Location, 'id'>
