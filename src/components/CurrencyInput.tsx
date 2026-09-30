/** Numeric input for a currency amount; shows an inline error unless value > 0. */
export function CurrencyInput({
  value,
  onChange,
}: {
  value: number
  onChange: (next: number) => void
}) {
  const showError = !(value > 0)

  return (
    <div className="currency-input">
      <input
        type="number"
        step="0.01"
        value={Number.isNaN(value) ? '' : value}
        onChange={(e) => onChange(e.target.valueAsNumber)}
      />
      {showError && (
        <p role="alert" className="error">
          Amount must be greater than zero.
        </p>
      )}
    </div>
  )
}
