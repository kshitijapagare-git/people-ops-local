import { useMemo, useState, type ReactNode } from 'react'

export interface DataTableColumn<T> {
  key: string
  header: string
  sortable?: boolean
  render: (row: T) => ReactNode
  sortValue?: (row: T) => string | number
}

type SortDirection = 'asc' | 'desc'

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  emptyMessage,
}: {
  columns: DataTableColumn<T>[]
  rows: T[]
  emptyMessage: string
}) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows
    const column = columns.find((col) => col.key === sortKey)
    if (!column || !column.sortValue) return rows
    const sortValue = column.sortValue
    const sorted = [...rows].sort((a, b) => {
      const valueA = sortValue(a)
      const valueB = sortValue(b)
      if (valueA < valueB) return -1
      if (valueA > valueB) return 1
      return 0
    })
    return sortDirection === 'asc' ? sorted : sorted.reverse()
  }, [rows, columns, sortKey, sortDirection])

  function toggleSort(column: DataTableColumn<T>) {
    if (!column.sortable) return
    if (sortKey !== column.key) {
      setSortKey(column.key)
      setSortDirection('asc')
      return
    }
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  return (
    <div className="card table-card">
      <table className="table data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={column.sortable ? 'data-table-sortable' : undefined}
                onClick={() => toggleSort(column)}
                aria-sort={
                  sortKey === column.key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined
                }
              >
                {column.header}
                {column.sortable && (
                  <span className="data-table-sort-icon" aria-hidden="true">
                    {sortKey === column.key ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.length === 0 && (
            <tr>
              <td className="empty" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          )}
          {sortedRows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.key}>{column.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
