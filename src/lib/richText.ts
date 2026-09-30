/**
 * Strips HTML tags and decodes entities, returning only the user-visible text.
 * Used to validate "plain text length" for rich-text fields without ever
 * rendering the raw HTML (which callers must never do either).
 */
export function htmlToPlainText(html: string): string {
  const withoutTags = html.replace(/<[^>]*>/g, '')
  const withoutEntities = decodeEntities(withoutTags)
  return withoutEntities.replace(/\s+/g, ' ').trim()
}

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: ' ',
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
}

function decodeEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity: string) => {
    if (entity.startsWith('#x') || entity.startsWith('#X')) {
      const codePoint = Number.parseInt(entity.slice(2), 16)
      return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint)
    }
    if (entity.startsWith('#')) {
      const codePoint = Number.parseInt(entity.slice(1), 10)
      return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint)
    }
    return NAMED_ENTITIES[entity] ?? match
  })
}
