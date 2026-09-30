/**
 * Fixed-vocabulary multi-select. Offers only the supplied options and never
 * returns a duplicate value in its `value`/`onChange` array.
 */
export function MultiSelect<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[]
  value: T[]
  onChange: (next: T[]) => void
}) {
  function toggle(option: T) {
    if (value.includes(option)) {
      onChange(value.filter((existing) => existing !== option))
    } else {
      onChange([...value, option])
    }
  }

  return (
    <div className="multi-select" role="group">
      {options.map((option) => {
        const checked = value.includes(option)
        return (
          <label key={option} className="multi-select-option">
            <input type="checkbox" checked={checked} onChange={() => toggle(option)} />
            {option}
          </label>
        )
      })}
    </div>
  )
}
