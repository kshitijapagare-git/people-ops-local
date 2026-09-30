function toMinorUnits(input: string): number {
  const trimmed = input.trim()
  if (trimmed === '') return 0
  const negative = trimmed.startsWith('-')
  const unsigned = negative ? trimmed.slice(1) : trimmed
  const [wholePartRaw, fractionPartRaw = ''] = unsigned.split('.')
  const wholePart = wholePartRaw === '' ? '0' : wholePartRaw
  const fractionPart = (fractionPartRaw + '00').slice(0, 2)
  const digits = `${wholePart}${fractionPart}`.replace(/[^0-9]/g, '')
  const minorUnits = digits === '' ? 0 : parseInt(digits, 10)
  return negative ? -minorUnits : minorUnits
}

function toDisplayValue(minorUnits: number): string {
  const safeValue = Number.isFinite(minorUnits) ? Math.trunc(minorUnits) : 0
  const negative = safeValue < 0
  const abs = Math.abs(safeValue)
  const whole = Math.trunc(abs / 100)
  const fraction = abs % 100
  const fractionStr = fraction < 10 ? `0${fraction}` : `${fraction}`
  return `${negative ? '-' : ''}${whole}.${fractionStr}`
}

export function CurrencyInput({
  value,
  onChange,
  required,
}: {
  value: number
  onChange: (minorUnits: number) => void
  required?: boolean
}) {
  return (
    <input
      type="text"
      inputMode="decimal"
      className="currency-input"
      value={toDisplayValue(value)}
      required={required}
      onChange={(e) => onChange(toMinorUnits(e.target.value))}
    />
  )
}
