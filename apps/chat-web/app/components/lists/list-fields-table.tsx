import { Link } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { dateTimeString } from '@george-ai/web-utils'

import { graphql } from '../../gql'
import { ListFilesTable_ListFilesFragment, ListFieldsTable_ListFragment } from '../../gql/graphql'
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

graphql(`
  fragment ListFieldsTable_List on AiList {
    id
    fields {
      id
      name
      type
      order
      sourceType
      fileProperty
      prompt
      languageModel
    }
  }
`)

interface Field {
  id: string
  name: string
  type: string
  order: number
  sourceType: string
  fileProperty?: string | null
  prompt?: string | null
  languageModel?: string | null
}

interface FileData {
  id: string
  libraryId: string
  name: string
  originUri?: string | null
  mimeType: string
  size?: number | null
  processedAt?: string | null
  originModificationDate?: string | null
  crawledByCrawler?: { id: string; uri: string } | null
}

interface RowData {
  fileId: string
  libraryId: string
  fieldValues: Record<string, string | number | boolean | null>
}

interface ListFieldsTableProps {
  list: ListFieldsTable_ListFragment
  listFiles: ListFilesTable_ListFilesFragment
  onPageChange?: (page: number, pageSize: number, orderBy?: string, orderDirection?: 'asc' | 'desc') => void
}

export const ListFieldsTable = ({ list, listFiles, onPageChange }: ListFieldsTableProps) => {
  const { t, language } = useTranslation()

  // Extract state from fragment data (managed by URL/route)
  const currentPage = Math.floor(listFiles.skip / listFiles.take)
  const pageSize = listFiles.take
  const sortBy = listFiles.orderBy || 'name'
  const sortDirection = (listFiles.orderDirection as 'asc' | 'desc') || 'asc'

  // Sort fields by order for consistent display
  const sortedFields = useMemo(() => {
    return [...(list.fields || [])].sort((a, b) => a.order - b.order)
  }, [list.fields])

  // Local UI state (not managed by URL)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [visibleFields, setVisibleFields] = useState<Set<string>>(() => {
    // Show all fields by default
    return new Set(sortedFields.map(f => f.id))
  })
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    // Initialize all field columns with default width
    const initialWidths: Record<string, number> = {}
    sortedFields.forEach((field) => {
      initialWidths[field.id] = 150
    })
    return initialWidths
  })

  // Load from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined

    try {
      const saved = localStorage.getItem('listFieldsTable-columnWidths')
      if (saved) {
        const parsed = JSON.parse(saved)
        timeoutId = setTimeout(() => {
          setColumnWidths((prev) => {
            const newWidths: Record<string, number> = {}
            Object.keys(prev).forEach((fieldId) => {
              newWidths[fieldId] = parsed[fieldId] || prev[fieldId]
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
  }, [sortedFields])
  const [isResizing, setIsResizing] = useState<string | null>(null)

  const startXRef = useRef<number>(0)
  const startWidthRef = useRef<number>(0)
  const resizingColumnRef = useRef<string | null>(null)

  // Get field value for a file
  const getFieldValue = useCallback((file: FileData, field: Field): string | number | null => {
    if (field.sourceType === 'file_property' && field.fileProperty) {
      switch (field.fileProperty) {
        case 'name':
          return file.name
        case 'originUri':
          return file.originUri ?? null
        case 'crawlerUrl':
          return file.crawledByCrawler?.uri || null
        case 'processedAt':
          return file.processedAt ? dateTimeString(file.processedAt, language) : null
        case 'originModificationDate':
          return file.originModificationDate ? dateTimeString(file.originModificationDate, language) : null
        case 'size':
          return file.size ?? null
        case 'mimeType':
          return file.mimeType
        default:
          return null
      }
    }
    // For LLM computed fields, return placeholder for now
    return null // Will be computed by LLM later
  }, [language])

  // Transform data for display
  const transformedRows: RowData[] = useMemo(() => {
    return listFiles.files.map((file) => {
      const fieldValues: Record<string, string | number | boolean | null> = {}
      
      // Calculate values for all fields
      sortedFields.forEach(field => {
        fieldValues[field.id] = getFieldValue(file, field)
      })

      return {
        fileId: file.id,
        libraryId: file.libraryId,
        fieldValues
      }
    })
  }, [listFiles.files, sortedFields, getFieldValue])

  // Apply client-side filtering
  const filteredRows = useMemo(() => {
    return transformedRows.filter((row) => {
      return Object.entries(filters).every(([fieldId, filter]) => {
        if (!filter) return true
        const value = row.fieldValues[fieldId]
        return value?.toString().toLowerCase().includes(filter.toLowerCase()) ?? false
      })
    })
  }, [transformedRows, filters])

  // Pagination calculations for display (pagination component handles its own calculations)

  const handleSort = (fieldId: string) => {
    const field = sortedFields.find(f => f.id === fieldId)
    if (field?.sourceType === 'file_property' && field.fileProperty) {
      const newSortDirection = field.fileProperty === sortBy ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc'
      onPageChange?.(0, pageSize, field.fileProperty, newSortDirection)
    }
  }

  const handleFilter = (fieldId: string, value: string) => {
    setFilters((prev) => ({ ...prev, [fieldId]: value }))
  }

  const toggleFieldVisibility = (fieldId: string) => {
    const newVisible = new Set(visibleFields)
    if (newVisible.has(fieldId)) {
      newVisible.delete(fieldId)
    } else {
      newVisible.add(fieldId)
    }
    setVisibleFields(newVisible)
  }

  const visibleFieldsArray = sortedFields.filter((field) => visibleFields.has(field.id))

  const isSortable = (field: Field) => {
    return field.sourceType === 'file_property' && ['name', 'processedAt', 'originModificationDate'].includes(field.fileProperty || '')
  }

  const isFilterable = (field: Field) => {
    return field.sourceType === 'file_property' && field.type === 'string'
  }

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
            localStorage.setItem('listFieldsTable-columnWidths', JSON.stringify(newWidths))
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
        {/* Field visibility toggles */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium">{t('lists.files.showColumns')}:</span>
          {sortedFields.map((field) => (
            <label key={field.id} className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={visibleFields.has(field.id)}
                onChange={() => toggleFieldVisibility(field.id)}
              />
              {field.name}
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
            gridTemplateColumns: visibleFieldsArray.map((field) => `${columnWidths[field.id] || 150}px`).join(' '),
          }}
        >
          {/* Header Row */}
          {visibleFieldsArray.map((field) => (
            <div
              key={`header-${field.id}`}
              className="border-base-300 bg-base-200 relative border-b border-r text-sm"
              style={{
                minWidth: `${columnWidths[field.id] || 150}px`,
                width: `${columnWidths[field.id] || 150}px`,
              }}
            >
              <div className="space-y-2 p-2">
                {/* Field header with sorting */}
                <div className="flex items-center gap-1 overflow-hidden whitespace-nowrap text-nowrap hover:overflow-visible">
                  {isSortable(field) ? (
                    <button
                      type="button"
                      className="hover:text-primary flex items-center gap-1"
                      onClick={() => handleSort(field.id)}
                    >
                      {field.name}
                      {sortBy === field.fileProperty && <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                    </button>
                  ) : (
                    <span>{field.name}</span>
                  )}
                </div>

                {/* Filter input */}
                {isFilterable(field) && (
                  <input
                    type="text"
                    placeholder={t('lists.files.filterPlaceholder')}
                    className="input input-xs input-bordered w-full"
                    value={filters[field.id] || ''}
                    onChange={(e) => handleFilter(field.id, e.target.value)}
                  />
                )}
              </div>

              {/* Resize handle */}
              <div
                className="hover:bg-primary/30 absolute right-0 top-0 h-full w-2 cursor-col-resize transition-colors"
                style={{
                  backgroundColor: isResizing === field.id ? 'rgba(59, 130, 246, 0.5)' : 'transparent',
                  right: '-1px',
                }}
                onMouseDown={(e) => handleMouseDown(field.id, e)}
              />
            </div>
          ))}

          {/* Data Rows */}
          {filteredRows.length === 0 ? (
            <div
              className="border-base-300 border-b border-r p-8 text-center"
              style={{ gridColumn: `1 / ${visibleFieldsArray.length + 1}` }}
            >
              {t('lists.files.noFiles')}
            </div>
          ) : (
            filteredRows.map((row) =>
              visibleFieldsArray.map((field) => {
                const value = row.fieldValues[field.id]
                const displayValue = value?.toString() || '-'
                
                return (
                  <div
                    key={`${row.fileId}-${field.id}`}
                    className="border-base-300 hover:bg-base-100 border-b border-r p-2 text-sm"
                    style={{
                      minWidth: `${columnWidths[field.id] || 150}px`,
                      width: `${columnWidths[field.id] || 150}px`,
                      overflow: 'hidden',
                    }}
                  >
                    {field.fileProperty === 'name' ? (
                      <Link
                        to="/libraries/$libraryId/files/$fileId"
                        params={{
                          libraryId: row.libraryId,
                          fileId: row.fileId,
                        }}
                        className="link link-primary block overflow-hidden text-nowrap"
                        title={displayValue}
                      >
                        {displayValue}
                      </Link>
                    ) : field.fileProperty === 'originUri' && value ? (
                      <a
                        href={value.toString()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link link-primary block overflow-hidden text-nowrap"
                        title={displayValue}
                      >
                        {displayValue}
                      </a>
                    ) : (
                      <div className="overflow-hidden text-nowrap" title={displayValue}>
                        {displayValue}
                      </div>
                    )}
                  </div>
                )
              })
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

