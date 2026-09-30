import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import * as store from '../data/peopleOpsStore'
import type { PeopleOpsState } from '../data/peopleOpsStore'
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

export interface PeopleOpsApi {
  departments: Department[]
  employees: Employee[]
  jobRoles: JobRole[]
  locations: Location[]
  employments: Employment[]
  getDepartment: (id: string) => Department | undefined
  getEmployee: (id: string) => Employee | undefined
  getJobRole: (id: string) => JobRole | undefined
  getLocation: (id: string) => Location | undefined
  getEmployment: (id: string) => Employment | undefined
  createDepartment: (draft: DepartmentDraft) => void
  updateDepartment: (id: string, patch: Partial<DepartmentDraft>) => void
  deleteDepartment: (id: string) => void
  createEmployee: (draft: EmployeeDraft) => void
  updateEmployee: (id: string, patch: Partial<EmployeeDraft>) => void
  deleteEmployee: (id: string) => void
  createJobRole: (draft: JobRoleDraft) => void
  updateJobRole: (id: string, patch: Partial<JobRoleDraft>) => void
  deleteJobRole: (id: string) => void
  createLocation: (draft: LocationDraft) => void
  updateLocation: (id: string, patch: Partial<LocationDraft>) => void
  deleteLocation: (id: string) => void
  createEmployment: (draft: EmploymentDraft) => void
  updateEmployment: (id: string, patch: Partial<EmploymentDraft>) => void
  deleteEmployment: (id: string) => void
  listEmployeesWithoutActiveEmployment: (excludeEmploymentId?: string) => Employee[]
}

const PeopleOpsContext = createContext<PeopleOpsApi | null>(null)

export function PeopleOpsProvider({
  children,
  initialState = store.emptyState(),
}: {
  children: ReactNode
  initialState?: PeopleOpsState
}) {
  const [state, setState] = useState<PeopleOpsState>(initialState)

  // Mutations run against the current state outside the updater so a StoreError
  // reaches the caller, and ids are not consumed twice by StrictMode.
  const api = useMemo<PeopleOpsApi>(
    () => ({
      departments: store.listDepartments(state),
      employees: store.listEmployees(state),
      jobRoles: store.listJobRoles(state),
      locations: store.listLocations(state),
      employments: store.listEmployments(state),
      getDepartment: (id) => store.getDepartment(state, id),
      getEmployee: (id) => store.getEmployee(state, id),
      getJobRole: (id) => store.getJobRole(state, id),
      getLocation: (id) => store.getLocation(state, id),
      getEmployment: (id) => store.getEmployment(state, id),
      createDepartment: (draft) => setState(store.createDepartment(state, draft)),
      updateDepartment: (id, patch) => setState(store.updateDepartment(state, id, patch)),
      deleteDepartment: (id) => setState(store.deleteDepartment(state, id)),
      createEmployee: (draft) => setState(store.createEmployee(state, draft)),
      updateEmployee: (id, patch) => setState(store.updateEmployee(state, id, patch)),
      deleteEmployee: (id) => setState(store.deleteEmployee(state, id)),
      createJobRole: (draft) => setState(store.createJobRole(state, draft)),
      updateJobRole: (id, patch) => setState(store.updateJobRole(state, id, patch)),
      deleteJobRole: (id) => setState(store.deleteJobRole(state, id)),
      createLocation: (draft) => setState(store.createLocation(state, draft)),
      updateLocation: (id, patch) => setState(store.updateLocation(state, id, patch)),
      deleteLocation: (id) => setState(store.deleteLocation(state, id)),
      createEmployment: (draft) => setState(store.createEmployment(state, draft)),
      updateEmployment: (id, patch) => setState(store.updateEmployment(state, id, patch)),
      deleteEmployment: (id) => setState(store.deleteEmployment(state, id)),
      listEmployeesWithoutActiveEmployment: (excludeEmploymentId) =>
        store.listEmployeesWithoutActiveEmployment(state, excludeEmploymentId),
    }),
    [state],
  )

  return <PeopleOpsContext.Provider value={api}>{children}</PeopleOpsContext.Provider>
}

export function usePeopleOps(): PeopleOpsApi {
  const api = useContext(PeopleOpsContext)
  if (!api) throw new Error('usePeopleOps must be used inside a PeopleOpsProvider')
  return api
}
