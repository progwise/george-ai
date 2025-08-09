import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

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

  // Define columns
  const columns: Column[] = [
    { id: 'crawlerUrl', label: t('lists.files.columns.crawlerUrl'), sortable: false, filterable: true },
    { id: 'filename', label: t('lists.files.columns.filename'), sortable: true, filterable: true },
    { id: 'filePath', label: t('lists.files.columns.filePath'), sortable: false, filterable: true },
    { id: 'originUri', label: t('lists.files.columns.originUri'), sortable: false, filterable: true },
    { id: 'lastUpdate', label: t('lists.files.columns.lastUpdate'), sortable: true, filterable: false },
    { id: 'processedAt', label: t('lists.files.columns.processedAt'), sortable: true, filterable: false },
  ]

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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table-zebra table w-full">
          <thead>
            <tr>
              {visibleColumnsArray.map((column) => (
                <th key={column.id}>
                  <div className="space-y-2">
                    {/* Column header with sorting */}
                    <div className="flex items-center gap-1">
                      {column.sortable ? (
                        <button
                          type="button"
                          className="hover:text-primary flex items-center gap-1"
                          onClick={() => handleSort(column.id)}
                        >
                          {column.label}
                          {sortBy === column.id && (
                            <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
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
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredFiles.length === 0 ? (
              <tr>
                <td colSpan={visibleColumnsArray.length} className="py-8 text-center">
                  {t('lists.files.noFiles')}
                </td>
              </tr>
            ) : (
              filteredFiles.map((file) => (
                <tr key={file.id}>
                  {visibleColumnsArray.map((column) => (
                    <td key={column.id} className="max-w-xs">
                      {column.id === 'filename' ? (
                        <Link
                          to="/libraries/$libraryId/files/$fileId"
                          params={{
                            libraryId: file.libraryId,
                            fileId: file.id,
                          }}
                          className="link link-primary block truncate"
                          title={file[column.id] || undefined}
                        >
                          {file[column.id] || '-'}
                        </Link>
                      ) : column.id === 'originUri' && file.originUri ? (
                        <a
                          href={file.originUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link link-primary block truncate"
                          title={file[column.id] || undefined}
                        >
                          {file[column.id] || '-'}
                        </a>
                      ) : (
                        <div className="truncate" title={file[column.id] || undefined}>
                          {file[column.id] || '-'}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
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
    return url.pathname
  } catch {
    // If it's not a valid URL, try to extract path-like structure
    const lastSlashIndex = originUri.lastIndexOf('/')
    if (lastSlashIndex !== -1) {
      return originUri.substring(0, lastSlashIndex + 1)
    }
    return originUri
  }
}
