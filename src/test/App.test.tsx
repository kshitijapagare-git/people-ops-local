import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from '../App'
import { PeopleOpsProvider } from '../state/PeopleOpsContext'

function renderApp() {
  const user = userEvent.setup()
  render(
    <PeopleOpsProvider>
      <App />
    </PeopleOpsProvider>,
  )
  return user
}

async function addDepartment(user: ReturnType<typeof userEvent.setup>, name: string, code: string) {
  await user.click(screen.getByRole('button', { name: '+ Add department' }))
  const form = screen.getByRole('form', { name: 'Department form' })
  await user.type(within(form).getByLabelText('Name'), name)
  await user.type(within(form).getByLabelText('Code'), code)
  await user.click(within(form).getByRole('button', { name: 'Add' }))
}

describe('App', () => {
  it('shows empty states and pagination', () => {
    renderApp()
    expect(screen.getByText('No departments yet.')).toBeInTheDocument()
    expect(screen.getByText('Page 1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  it('paginates departments ten per page', async () => {
    const user = renderApp()
    for (let i = 1; i <= 11; i++) await addDepartment(user, `Dept ${i}`, `D${i}`)
    expect(screen.queryByRole('row', { name: /Dept 11/ })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(screen.getByText('Page 2')).toBeInTheDocument()
    expect(screen.getByRole('row', { name: /Dept 11/ })).toBeInTheDocument()
  })

  it('adds, edits and deletes a department', async () => {
    const user = renderApp()
    await addDepartment(user, 'Engineering', 'ENG')
    const row = screen.getByRole('row', { name: /Engineering/ })
    expect(within(row).getByText('ENG')).toBeInTheDocument()

    await user.click(within(row).getByRole('button', { name: 'Edit' }))
    const name = screen.getByLabelText('Name')
    await user.clear(name)
    await user.type(name, 'Platform')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByRole('row', { name: /Platform/ })).toBeInTheDocument()

    await user.click(within(screen.getByRole('row', { name: /Platform/ })).getByRole('button', { name: 'Delete' }))
    expect(screen.queryByRole('row', { name: /Platform/ })).not.toBeInTheDocument()
  })

  it('adds an employee linked to a department and shows the department name', async () => {
    const user = renderApp()
    await addDepartment(user, 'Engineering', 'ENG')
    await user.click(screen.getByRole('button', { name: 'Employees' }))
    await user.click(screen.getByRole('button', { name: '+ Add employee' }))

    await user.type(screen.getByLabelText('First name'), 'Jane')
    await user.type(screen.getByLabelText('Last name'), 'Doe')
    await user.type(screen.getByLabelText('Email'), 'jane@example.com')
    await user.type(screen.getByLabelText('Phone'), '555-0100')
    await user.selectOptions(screen.getByLabelText('Department'), 'Engineering')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    const row = screen.getByRole('row', { name: /Jane/ })
    expect(within(row).getByText('Engineering')).toBeInTheDocument()
    expect(within(row).getByText('jane@example.com')).toBeInTheDocument()
  })

  it('does not offer the seeded division as a selectable department', async () => {
    const user = renderApp()
    await addDepartment(user, 'Engineering', 'ENG')
    await user.click(screen.getByRole('button', { name: 'Employees' }))
    await user.click(screen.getByRole('button', { name: '+ Add employee' }))
    const options = within(screen.getByLabelText('Department'))
      .getAllByRole('option')
      .map((option) => option.textContent)
    expect(options).toEqual(['Select a department', 'Engineering'])
  })

  it('shows an error when an employee has no department', async () => {
    const user = renderApp()
    await user.click(screen.getByRole('button', { name: 'Employees' }))
    await user.click(screen.getByRole('button', { name: '+ Add employee' }))
    await user.type(screen.getByLabelText('First name'), 'Jane')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByRole('alert')).toHaveTextContent('No department with id')
    expect(screen.queryByRole('row', { name: /Jane/ })).not.toBeInTheDocument()
  })

  it('navigates to Requisitions from the sidebar', async () => {
    const user = renderApp()
    await user.click(screen.getByRole('button', { name: 'Requisitions' }))
    expect(screen.getByRole('heading', { name: 'Requisitions' })).toBeInTheDocument()
    expect(screen.getByText('No requisitions yet.')).toBeInTheDocument()
  })
})
