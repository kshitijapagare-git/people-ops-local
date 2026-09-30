export function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix = '',
  onChange,
  disabled,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix?: string
  onChange: (value: number) => void
  disabled?: boolean
}) {
  return (
    <div className={`slider${disabled ? ' slider-disabled' : ''}`}>
      <span className="slider-label">{label}</span>
      <input
        type="range"
        className="slider-input"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="slider-readout">
        {value}
        {suffix}
      </span>
    </div>
  )
}
