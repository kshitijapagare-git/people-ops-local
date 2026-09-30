function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function Stepper({
  value,
  onChange,
  min,
  max,
  step,
}: {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
}) {
  function decrement() {
    const next = clamp(value - step, min, max)
    if (next !== value) onChange(next)
  }

  function increment() {
    const next = clamp(value + step, min, max)
    if (next !== value) onChange(next)
  }

  function handleInputChange(raw: string) {
    const parsed = Number(raw)
    if (Number.isNaN(parsed)) return
    onChange(clamp(parsed, min, max))
  }

  return (
    <div className="stepper">
      <button
        type="button"
        className="stepper-btn"
        aria-label="Decrement"
        disabled={value <= min}
        onClick={decrement}
      >
        −
      </button>
      <input
        type="number"
        className="stepper-input"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => handleInputChange(e.target.value)}
      />
      <button
        type="button"
        className="stepper-btn"
        aria-label="Increment"
        disabled={value >= max}
        onClick={increment}
      >
        +
      </button>
    </div>
  )
}
