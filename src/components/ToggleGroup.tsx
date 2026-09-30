export function ToggleGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label?: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  disabled?: boolean
}) {
  return (
    <div className="toggle-group">
      {label && <span className="toggle-group-label">{label}</span>}
      <div className="toggle-group-options">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`toggle-btn${option.value === value ? ' toggle-active' : ''}`}
            aria-pressed={option.value === value}
            disabled={disabled}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
