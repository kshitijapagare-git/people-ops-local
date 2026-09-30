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
  OrgUnit,
  OrgUnitDraft,
  Requisition,
  RequisitionDraft,
} from '../types'

export interface PeopleOpsApi {
  departments: Department[]
  employees: Employee[]
  requisitions: Requisition[]
  orgUnits: OrgUnit[]
  employments: Employment[]
  getDepartment: (id: string) => Department | undefined
  getEmployee: (id: string) => Employee | undefined
  createDepartment: (draft: DepartmentDraft) => void
  updateDepartment: (id: string, patch: Partial<DepartmentDraft>) => void
  deleteDepartment: (id: string) => void
  createEmployee: (draft: EmployeeDraft) => void
  updateEmployee: (id: string, patch: Partial<EmployeeDraft>) => void
  deleteEmployee: (id: string) => void
  createRequisition: (draft: RequisitionDraft) => void
  updateRequisition: (id: string, patch: Partial<RequisitionDraft>) => void
  deleteRequisition: (id: string) => void
  createOrgUnit: (draft: OrgUnitDraft) => void
  updateOrgUnit: (id: string, patch: Partial<OrgUnitDraft>) => void
  deleteOrgUnit: (id: string) => void
  createEmployment: (draft: EmploymentDraft) => void
  updateEmployment: (id: string, patch: Partial<EmploymentDraft>) => void
  deleteEmployment: (id: string) => void
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
      requisitions: store.listRequisitions(state),
      orgUnits: store.listOrgUnits(state),
      employments: store.listEmployments(state),
      getDepartment: (id) => store.getDepartment(state, id),
      getEmployee: (id) => store.getEmployee(state, id),
      createDepartment: (draft) => setState(store.createDepartment(state, draft)),
      updateDepartment: (id, patch) => setState(store.updateDepartment(state, id, patch)),
      deleteDepartment: (id) => setState(store.deleteDepartment(state, id)),
      createEmployee: (draft) => setState(store.createEmployee(state, draft)),
      updateEmployee: (id, patch) => setState(store.updateEmployee(state, id, patch)),
      deleteEmployee: (id) => setState(store.deleteEmployee(state, id)),
      createRequisition: (draft) => setState(store.createRequisition(state, draft)),
      updateRequisition: (id, patch) => setState(store.updateRequisition(state, id, patch)),
      deleteRequisition: (id) => setState(store.deleteRequisition(state, id)),
      createOrgUnit: (draft) => setState(store.createOrgUnit(state, draft)),
      updateOrgUnit: (id, patch) => setState(store.updateOrgUnit(state, id, patch)),
      deleteOrgUnit: (id) => setState(store.deleteOrgUnit(state, id)),
      createEmployment: (draft) => setState(store.createEmployment(state, draft)),
      updateEmployment: (id, patch) => setState(store.updateEmployment(state, id, patch)),
      deleteEmployment: (id) => setState(store.deleteEmployment(state, id)),
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
