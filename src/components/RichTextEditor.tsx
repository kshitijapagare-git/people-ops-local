import { useRef, type FormEvent } from 'react'

/**
 * Minimal rich-text editor: a contentEditable surface that edits and emits
 * raw HTML. Consumers are responsible for validating/sanitizing the HTML
 * (see src/lib/richText.ts) and must never dangerouslySetInnerHTML it back
 * into a list/summary view.
 */
export function RichTextEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (html: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  function handleInput(event: FormEvent<HTMLDivElement>) {
    onChange(event.currentTarget.innerHTML)
  }

  return (
    <div
      ref={ref}
      className="rich-text-editor"
      role="textbox"
      aria-multiline="true"
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      // Set once on mount; subsequent edits are driven by the DOM itself so the
      // cursor position is not reset on every keystroke.
      dangerouslySetInnerHTML={{ __html: value }}
    />
  )
}
