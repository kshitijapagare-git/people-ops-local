import { useState } from 'react'
import { isAfterDateString } from '../lib/date'

const RANGE_PATTERN = /^(\d{4}-\d{2}-\d{2})\s*(?:to|-)\s*(\d{4}-\d{2}-\d{2})$/

function formatRange(from: string, until: string): string {
  if (!from && !until) return ''
  return `${from} to ${until}`
}

/**
 * A single composite text input that writes both bound date values (local
 * YYYY-MM-DD strings), entered as "<from> to <until>". Validates live, as
 * soon as the text parses to two dates, that `until` is after `from` —
 * never waits for submit.
 */
export function DateRangePicker({
  from,
  until,
  onChange,
}: {
  from: string
  until: string
  onChange: (from: string, until: string) => void
}) {
  const [text, setText] = useState(() => formatRange(from, until))

  const showError = from !== '' && until !== '' && !isAfterDateString(until, from)

  function handleChange(value: string) {
    setText(value)
    const match = RANGE_PATTERN.exec(value.trim())
    if (match) {
      onChange(match[1], match[2])
    }
  }

  return (
    <div className="date-range-picker">
      <label>
        Open window (YYYY-MM-DD to YYYY-MM-DD)
        <input type="text" value={text} onChange={(e) => handleChange(e.target.value)} />
      </label>
      {showError && (
        <p role="alert" className="error">
          The until date must be after the from date.
        </p>
      )}
    </div>
  )
}
