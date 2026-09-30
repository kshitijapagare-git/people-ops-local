import { useState } from 'react'

interface TreeNode {
  id: string
  name: string
  parentId: string | null
}

/**
 * Renders a full parent/child tree. Parent nodes only expand/collapse;
 * only nodes for which `isSelectable` returns true invoke `onSelect`.
 */
export function TreeSelect<T extends TreeNode>({
  nodes,
  value,
  onSelect,
  isSelectable,
}: {
  nodes: T[]
  value: string | null
  onSelect: (id: string) => void
  isSelectable: (node: T) => boolean
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const roots = nodes.filter((node) => node.parentId === null)

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function renderNode(node: T): JSX.Element {
    const children = nodes.filter((child) => child.parentId === node.id)
    const selectable = isSelectable(node)
    const isExpanded = expanded.has(node.id)

    return (
      <li key={node.id} className="tree-select-node">
        <button
          type="button"
          className={`tree-select-item${value === node.id ? ' selected' : ''}`}
          aria-current={value === node.id ? 'true' : undefined}
          onClick={() => {
            if (selectable) onSelect(node.id)
            else if (children.length > 0) toggle(node.id)
          }}
        >
          {children.length > 0 && <span aria-hidden="true">{isExpanded ? '▾' : '▸'}</span>}
          {node.name}
        </button>
        {children.length > 0 && isExpanded && (
          <ul className="tree-select-children">{children.map((child) => renderNode(child))}</ul>
        )}
      </li>
    )
  }

  return (
    <ul className="tree-select" role="tree">
      {roots.map((node) => renderNode(node))}
    </ul>
  )
}
