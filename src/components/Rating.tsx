export function Rating({
  value = 0,
  max = 5,
  onChange,
  disabled,
}: {
  value?: number
  max?: number
  onChange: (value: number) => void
  disabled?: boolean
}) {
  const stars = Array.from({ length: max }, (_, index) => index + 1)

  return (
    <div className={`rating${disabled ? ' disabled' : ''}`}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn${star <= value ? ' star-filled' : ''}`}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          aria-pressed={star <= value}
          disabled={disabled}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
    </div>
  )
}
