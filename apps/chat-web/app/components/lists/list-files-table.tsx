import { Link } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { dateTimeString } from '@george-ai/web-utils'

import { graphql } from '../../gql'
import { ListFilesTable_ListFilesFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { Pagination } from '../table/pagination'

graphql(`
  fragment ListFilesTable_ListFiles on AiListFilesQueryResult {
    listId
    count
    take
    skip
    orderBy
    orderDirection
    files {
      id
      name
      originUri
      mimeType
      size
      processedAt
      originModificationDate
      libraryId
      crawledByCrawler {
        id
        uri
      }
    }
  }
`)

interface Column {
  id: keyof FileRowData
  label: string
  sortable: boolean
  filterable: boolean
}

interface FileRowData {
  id: string
  libraryId: string
  crawlerUrl: string | null
  filename: string
  filePath: string
  originUri: string | null
  lastUpdate: string | null
  processedAt: string | null
}

interface ListFilesTableProps {
  listFiles: ListFilesTable_ListFilesFragment
  onPageChange?: (page: number, pageSize: number, orderBy?: string, orderDirection?: 'asc' | 'desc') => void
}

export const ListFilesTable = ({ listFiles, onPageChange }: ListFilesTableProps) => {
  const { t, language } = useTranslation()

  // Extract state from fragment data (managed by URL/route)
  const currentPage = Math.floor(listFiles.skip / listFiles.take)
  const pageSize = listFiles.take
  const sortBy = listFiles.orderBy || 'name'
  const sortDirection = (listFiles.orderDirection as 'asc' | 'desc') || 'asc'

  // Local UI state (not managed by URL)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof FileRowData>>(
    () => new Set(['crawlerUrl', 'filename', 'filePath', 'originUri', 'lastUpdate', 'processedAt']),
  )
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    // Always start with default widths for SSR consistency
    const initialWidths: Record<string, number> = {}
    const defaultColumns = ['crawlerUrl', 'filename', 'filePath', 'originUri', 'lastUpdate', 'processedAt']
    defaultColumns.forEach((columnId) => {
      initialWidths[columnId] = 150
    })
    return initialWidths
  })

  // Load from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined

    try {
      const saved = localStorage.getItem('listFilesTable-columnWidths')
      if (saved) {
        const parsed = JSON.parse(saved)
        timeoutId = setTimeout(() => {
          setColumnWidths((prev) => {
            const newWidths: Record<string, number> = {}
            Object.keys(prev).forEach((columnId) => {
              newWidths[columnId] = parsed[columnId] || prev[columnId]
            })
            return newWidths
          })
        }, 0)
      }
    } catch {
      // If localStorage fails, keep defaults
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])
  const [isResizing, setIsResizing] = useState<string | null>(null)

  const startXRef = useRef<number>(0)
  const startWidthRef = useRef<number>(0)
  const resizingColumnRef = useRef<string | null>(null)

  // Define columns with useMemo to prevent re-renders
  const columns: Column[] = useMemo(
    () => [
      { id: 'crawlerUrl', label: t('lists.files.columns.crawlerUrl'), sortable: false, filterable: true },
      { id: 'filename', label: t('lists.files.columns.filename'), sortable: true, filterable: true },
      { id: 'filePath', label: t('lists.files.columns.filePath'), sortable: false, filterable: true },
      { id: 'originUri', label: t('lists.files.columns.originUri'), sortable: false, filterable: true },
      { id: 'lastUpdate', label: t('lists.files.columns.lastUpdate'), sortable: true, filterable: false },
      { id: 'processedAt', label: t('lists.files.columns.processedAt'), sortable: true, filterable: false },
    ],
    [t],
  )

  // Transform data for display
  const transformedFiles: FileRowData[] = useMemo(() => {
    return listFiles.files.map((file) => {
      const filePath = file.originUri ? extractFilePath(file.originUri) : ''

      return {
        id: file.id,
        libraryId: file.libraryId,
        crawlerUrl: file.crawledByCrawler?.uri || null,
        filename: file.name,
        filePath,
        originUri: file.originUri || null,
        lastUpdate: file.originModificationDate ? dateTimeString(file.originModificationDate, language) : null,
        processedAt: file.processedAt ? dateTimeString(file.processedAt, language) : null,
      }
    })
  }, [listFiles.files, language])

  // Apply client-side filtering for non-sortable columns
  const filteredFiles = useMemo(() => {
    return transformedFiles.filter((file) => {
      return Object.entries(filters).every(([column, filter]) => {
        if (!filter) return true
        const value = file[column as keyof FileRowData]
        return value?.toString().toLowerCase().includes(filter.toLowerCase()) ?? false
      })
    })
  }, [transformedFiles, filters])

  // Pagination calculations for display (pagination component handles its own calculations)

  const handleSort = (columnId: string) => {
    const newSortDirection = columnId === sortBy ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc'
    onPageChange?.(0, pageSize, columnId, newSortDirection)
  }

  const handleFilter = (columnId: string, value: string) => {
    setFilters((prev) => ({ ...prev, [columnId]: value }))
  }

  const toggleColumnVisibility = (columnId: keyof FileRowData) => {
    const newVisible = new Set(visibleColumns)
    if (newVisible.has(columnId)) {
      newVisible.delete(columnId)
    } else {
      newVisible.add(columnId)
    }
    setVisibleColumns(newVisible)
  }

  const visibleColumnsArray = columns.filter((col) => visibleColumns.has(col.id))

  // Column resizing handlers
  const handleMouseDown = useCallback(
    (columnId: string, event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()

      setIsResizing(columnId)
      resizingColumnRef.current = columnId
      startXRef.current = event.clientX

      // Get current column width or use default
      const currentWidth = columnWidths[columnId] || 150
      startWidthRef.current = currentWidth

      const handleMouseMove = (e: MouseEvent) => {
        if (!resizingColumnRef.current) return

        const diff = e.clientX - startXRef.current
        const newWidth = Math.max(60, startWidthRef.current + diff) // Minimum width of 60px

        setColumnWidths((prev) => {
          const newWidths = {
            ...prev,
            [resizingColumnRef.current!]: newWidth,
          }
          // Save to localStorage
          try {
            localStorage.setItem('listFilesTable-columnWidths', JSON.stringify(newWidths))
          } catch {
            // Ignore localStorage errors
          }
          return newWidths
        })
      }

      const handleMouseUp = () => {
        setIsResizing(null)
        resizingColumnRef.current = null
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = 'auto'
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
    },
    [columnWidths],
  )

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Column visibility toggles */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium">{t('lists.files.showColumns')}:</span>
          {columns.map((column) => (
            <label key={column.id} className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={visibleColumns.has(column.id)}
                onChange={() => toggleColumnVisibility(column.id)}
              />
              {column.label}
            </label>
          ))}
        </div>

        {/* Right side controls */}
        <div className="flex flex-col">
          {/* Page size selector */}
          <div className="text-xs">{t('lists.files.pageSize')}:</div>
          <div className="flex items-center gap-2">
            <select
              className="select select-sm select-bordered h-full"
              value={pageSize}
              onChange={(e) => {
                const newPageSize = Number(e.target.value)
                onPageChange?.(0, newPageSize, sortBy, sortDirection)
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            {/* Pagination */}
            <Pagination
              totalItems={listFiles.count}
              itemsPerPage={pageSize}
              currentPage={currentPage + 1} // Convert from 0-based to 1-based
              onPageChange={(page) => onPageChange?.(page - 1, pageSize, sortBy, sortDirection)} // Convert back to 0-based
              className="flex-shrink-0"
            />
          </div>
        </div>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto">
        <div
          className="border-base-300 grid"
          style={{
            gridTemplateColumns: visibleColumnsArray.map((col) => `${columnWidths[col.id] || 150}px`).join(' '),
          }}
        >
          {/* Header Row */}
          {visibleColumnsArray.map((column) => (
            <div
              key={`header-${column.id}`}
              className="border-base-300 bg-base-200 relative border-b border-r text-sm"
              style={{
                minWidth: `${columnWidths[column.id] || 150}px`,
                width: `${columnWidths[column.id] || 150}px`,
              }}
            >
              <div className="space-y-2 p-2">
                {/* Column header with sorting */}
                <div className="flex items-center gap-1 overflow-hidden whitespace-nowrap text-nowrap hover:overflow-visible">
                  {column.sortable ? (
                    <button
                      type="button"
                      className="hover:text-primary flex items-center gap-1"
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                      {sortBy === column.id && <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                    </button>
                  ) : (
                    <span>{column.label}</span>
                  )}
                </div>

                {/* Filter input */}
                {column.filterable && (
                  <input
                    type="text"
                    placeholder={t('lists.files.filterPlaceholder')}
                    className="input input-xs input-bordered w-full"
                    value={filters[column.id] || ''}
                    onChange={(e) => handleFilter(column.id, e.target.value)}
                  />
                )}
              </div>

              {/* Resize handle */}
              <div
                className="hover:bg-primary/30 absolute right-0 top-0 h-full w-2 cursor-col-resize transition-colors"
                style={{
                  backgroundColor: isResizing === column.id ? 'rgba(59, 130, 246, 0.5)' : 'transparent',
                  right: '-1px',
                }}
                onMouseDown={(e) => handleMouseDown(column.id, e)}
              />
            </div>
          ))}

          {/* Data Rows */}
          {filteredFiles.length === 0 ? (
            <div
              className="border-base-300 border-b border-r p-8 text-center"
              style={{ gridColumn: `1 / ${visibleColumnsArray.length + 1}` }}
            >
              {t('lists.files.noFiles')}
            </div>
          ) : (
            filteredFiles.map((file) =>
              visibleColumnsArray.map((column) => (
                <div
                  key={`${file.id}-${column.id}`}
                  className="border-base-300 hover:bg-base-100 border-b border-r p-2 text-sm"
                  style={{
                    minWidth: `${columnWidths[column.id] || 150}px`,
                    width: `${columnWidths[column.id] || 150}px`,
                    overflow: 'hidden',
                  }}
                >
                  {column.id === 'filename' ? (
                    <Link
                      to="/libraries/$libraryId/files/$fileId"
                      params={{
                        libraryId: file.libraryId,
                        fileId: file.id,
                      }}
                      className="link link-primary block overflow-hidden text-nowrap"
                      title={file[column.id] || undefined}
                    >
                      {file[column.id] || '-'}
                    </Link>
                  ) : column.id === 'originUri' && file.originUri ? (
                    <a
                      href={file.originUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link link-primary block overflow-hidden text-nowrap"
                      title={file[column.id] || undefined}
                    >
                      {file[column.id] || '-'}
                    </a>
                  ) : (
                    <div className="overflow-hidden text-nowrap" title={file[column.id] || undefined}>
                      {file[column.id] || '-'}
                    </div>
                  )}
                </div>
              )),
            )
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="text-base-content/70 text-sm">
        {t('lists.files.showing', {
          start: currentPage * pageSize + 1,
          end: Math.min((currentPage + 1) * pageSize, listFiles.count),
          total: listFiles.count,
        })}
      </div>
    </div>
  )
}

// Helper function to extract file path from originUri
function extractFilePath(originUri: string): string {
  try {
    const url = new URL(originUri)
    return decodeURIComponent(url.pathname)
  } catch {
    // If it's not a valid URL, try to extract path-like structure
    const lastSlashIndex = originUri.lastIndexOf('/')
    if (lastSlashIndex !== -1) {
      const path = originUri.substring(0, lastSlashIndex + 1)
      return decodeURIComponent(path)
    }
    return decodeURIComponent(originUri)
  }
}
