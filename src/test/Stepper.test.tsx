import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Stepper } from '../components/Stepper'

function ControlledStepper({ initial }: { initial: number }) {
  const [value, setValue] = useState(initial)
  return (
    <div>
      <span data-testid="value">{value}</span>
      <Stepper value={value} onChange={setValue} min={1} max={5000} step={5} />
    </div>
  )
}

describe('Stepper', () => {
  it('clamps at the minimum bound', async () => {
    const user = userEvent.setup()
    render(<ControlledStepper initial={1} />)
    await user.click(screen.getByRole('button', { name: /decrement/i }))
    expect(screen.getByTestId('value')).toHaveTextContent('1')
  })

  it('clamps at the maximum bound', async () => {
    const user = userEvent.setup()
    render(<ControlledStepper initial={5000} />)
    await user.click(screen.getByRole('button', { name: /increment/i }))
    expect(screen.getByTestId('value')).toHaveTextContent('5000')
  })

  it('steps by the configured amount within bounds', async () => {
    const user = userEvent.setup()
    render(<ControlledStepper initial={50} />)
    await user.click(screen.getByRole('button', { name: /increment/i }))
    expect(screen.getByTestId('value')).toHaveTextContent('55')
    await user.click(screen.getByRole('button', { name: /decrement/i }))
    expect(screen.getByTestId('value')).toHaveTextContent('50')
  })
})
