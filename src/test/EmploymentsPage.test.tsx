import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { EmploymentsPage } from '../pages/EmploymentsPage'
import { PeopleOpsProvider } from '../state/PeopleOpsContext'
import * as store from '../data/peopleOpsStore'

// Built from local date parts (not toISOString/UTC) so it lines up with how
// EmploymentsPage compares "today" (local calendar date) against the date-picker value.
function isoDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function renderWithFixtures() {
  let state = store.createDepartment(store.emptyState(), { name: 'Engineering', code: 'ENG' })
  state = store.createEmployee(state, {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    phone: '555-0100',
    departmentId: 'dep_1',
  })
  state = store.createJobRole(state, { title: 'Engineer', isPeopleManager: false })
  state = store.createLocation(state, { name: 'HQ', headcountCap: 100 })

  const user = userEvent.setup()
  render(
    <PeopleOpsProvider initialState={state}>
      <EmploymentsPage />
    </PeopleOpsProvider>,
  )
  return user
}

describe('EmploymentsPage', () => {
  it('forces fteAllocation to 100 and disables the slider when FULL_TIME is selected', async () => {
    const user = renderWithFixtures()
    await user.click(screen.getByRole('button', { name: '+ Add employment' }))

    // FULL_TIME is the default, so the slider starts disabled at 100%.
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByRole('slider')).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Part time' }))
    expect(screen.getByRole('slider')).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Full time' }))
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByRole('slider')).toBeDisabled()
  })

  it('disables the probation rating at exactly 90 days and enables it beyond 90 days', async () => {
    const user = renderWithFixtures()
    await user.click(screen.getByRole('button', { name: '+ Add employment' }))

    const joinedOnInput = screen.getByLabelText('Joined on')
    await user.clear(joinedOnInput)
    await user.type(joinedOnInput, isoDaysAgo(90))
    expect(screen.getByRole('button', { name: '1 star' })).toBeDisabled()

    await user.clear(joinedOnInput)
    await user.type(joinedOnInput, isoDaysAgo(91))
    expect(screen.getByRole('button', { name: '1 star' })).toBeEnabled()
  })
})
