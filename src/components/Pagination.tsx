import { useState } from 'react'

export const PAGE_SIZE = 10

export function usePagination<T>(items: T[], pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  // Clamp so deleting the last row on a page falls back to the previous page.
  const current = Math.min(page, pageCount)
  const start = (current - 1) * pageSize
  return {
    page: current,
    pageCount,
    pageItems: items.slice(start, start + pageSize),
    setPage,
  }
}

export function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number
  pageCount: number
  onChange: (page: number) => void
}) {
  return (
    <div className="pagination">
      <span>Page {page}</span>
      <div className="pagination-buttons">
        <button
          type="button"
          className="page-btn"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          ‹
        </button>
        <button
          type="button"
          className="page-btn"
          aria-label="Next page"
          disabled={page >= pageCount}
          onClick={() => onChange(page + 1)}
        >
          ›
        </button>
      </div>
    </div>
  )
}
