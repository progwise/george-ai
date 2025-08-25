import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { graphql } from '../../gql'
import {
  FieldModal_EditableFieldFragment,
  ListFieldsTable_FieldFragment,
  ListFieldsTable_ListFragment,
  ListFilesTable_FilesQueryResultFragment,
} from '../../gql/graphql'
import { useLocalstorage } from '../../hooks/use-local-storage'
import { useTranslation } from '../../i18n/use-translation-hook'
import { MenuEllipsisIcon } from '../../icons/menu-ellipsis-icon'
import { PlusIcon } from '../../icons/plus-icon'
import { Pagination } from '../table/pagination'
import { FieldHeaderDropdown } from './field-header-dropdown'
import { FieldItemDropdown } from './field-item-dropdown'
import { FieldModal } from './field-modal'
import { getListFilesWithValuesQueryOptions } from './get-list-files-with-values'

graphql(`
  fragment ListFilesTable_File on AiLibraryFile {
    id
    name
    libraryId
  }
`)

// Note: We can't use variables in fragments, so fieldValues will be queried separately
graphql(`
  fragment ListFilesTable_FilesQueryResult on AiListFilesQueryResult {
    listId
    count
    take
    skip
    orderBy
    orderDirection
    files {
      ...ListFilesTable_File
    }
  }
`)

graphql(`
  fragment ListFieldsTable_Field on AiListField {
    id
    listId
    name
    type
    order
    sourceType
    fileProperty
    prompt
    contentQuery
    languageModel
    useVectorStore
    pendingItemsCount
    processingItemsCount
    context {
      contextFieldId
    }
  }
`)

graphql(`
  fragment ListFieldsTable_List on AiList {
    id
    fields {
      ...ListFieldsTable_Field
    }
  }
`)

interface ListFieldsTableProps {
  list: ListFieldsTable_ListFragment
  listFiles: ListFilesTable_FilesQueryResultFragment
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

  // Fetch field values for all files
  const fieldIds = useMemo(() => sortedFields.map((f) => f.id), [sortedFields])

  // Check if there are any active enrichments (pending or processing)
  const hasActiveEnrichments = useMemo(() => {
    return sortedFields.some((field) => field.pendingItemsCount > 0 || field.processingItemsCount > 0)
  }, [sortedFields])

  const { data: filesWithValues } = useSuspenseQuery(
    getListFilesWithValuesQueryOptions({
      listId: listFiles.listId,
      skip: listFiles.skip,
      take: listFiles.take,
      orderBy: listFiles.orderBy || undefined,
      orderDirection: listFiles.orderDirection as 'asc' | 'desc' | undefined,
      fieldIds,
      language,
      hasActiveEnrichments,
    }),
  )

  const [fieldVisibility, setFieldVisibility] = useLocalstorage<Record<string, boolean>>(
    'listFieldsTable-fieldVisibility',
  )
  // Initialize column widths with localStorage persistence
  const [columnWidths, setColumnWidths] = useLocalstorage<Record<string, number>>('listFieldsTable-columnWidths')

  // Ensure all fields have width values - only set defaults when needed
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setColumnWidths((prev) => {
        const newWidths = prev || {}
        let hasChanges = false

        sortedFields.forEach((field) => {
          if (!(field.id in newWidths) || typeof newWidths[field.id] !== 'number') {
            newWidths[field.id] = 150
            hasChanges = true
          }
        })

        return hasChanges ? newWidths : prev
      })
    }, 0)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Do NOT add setColumnWidths to dependencies - it causes excessive re-rendering during column resize
  }, [sortedFields])

  // Auto-show new fields when they're added
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFieldVisibility((prev) => {
        const newVisibility = prev || {}
        let hasChanges = false

        sortedFields.forEach((field) => {
          if (!(field.id in newVisibility)) {
            newVisibility[field.id] = true // New fields are visible by default
            hasChanges = true
          }
        })

        return hasChanges ? newVisibility : prev
      })
    }, 0)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Do NOT add setFieldVisibility to dependencies - it causes excessive re-rendering during column resize
  }, [sortedFields])

  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false)
  const [editField, setEditField] = useState<FieldModal_EditableFieldFragment | null>(null)
  const [fieldDropdownOpen, setFieldDropdownOpen] = useState<string | null>(null)
  const [itemDropdownOpen, setItemDropdownOpen] = useState<string | null>(null)

  const startXRef = useRef<number>(0)
  const startWidthRef = useRef<number>(0)
  const resizingColumnRef = useRef<string | null>(null)
  const columnWidthsRef = useRef<Record<string, number> | null>(null)

  // Keep column widths ref in sync
  columnWidthsRef.current = columnWidths

  // Helper to get field value and error from the fetched data
  const getFieldData = useCallback(
    (fileId: string, fieldId: string): { value: string | null; error: string | null; queueStatus: string | null } => {
      if (!filesWithValues) return { value: null, error: null, queueStatus: null }

      const file = filesWithValues.aiListFiles.files.find((f: { id: string }) => f.id === fileId)
      if (!file) return { value: null, error: null, queueStatus: null }

      const fieldValue = file.fieldValues.find((fv: { fieldId: string }) => fv.fieldId === fieldId)
      return {
        value: fieldValue?.displayValue || null,
        error: fieldValue?.enrichmentErrorMessage || null,
        queueStatus: fieldValue?.queueStatus || null,
      }
    },
    [filesWithValues],
  )

  const handleSort = (fieldId: string) => {
    const field = sortedFields.find((f) => f.id === fieldId)
    if (field) {
      if (field.sourceType === 'file_property' && field.fileProperty) {
        // Sort by file property
        const newSortDirection = field.fileProperty === sortBy ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc'
        onPageChange?.(0, pageSize, field.fileProperty, newSortDirection)
      } else if (field.sourceType === 'llm_computed') {
        // Sort by computed field (use field ID as the orderBy value)
        const newSortDirection = field.id === sortBy ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc'
        onPageChange?.(0, pageSize, field.id, newSortDirection)
      }
    }
  }

  const toggleFieldVisibility = (fieldId: string) => {
    setFieldVisibility((prev) => ({
      ...(prev || {}),
      [fieldId]: !(prev?.[fieldId] ?? true),
    }))
  }

  const visibleFieldsArray = sortedFields.filter((field) => fieldVisibility?.[field.id] ?? true)

  const isSortable = (field: ListFieldsTable_FieldFragment) => {
    return (
      (field.sourceType === 'file_property' &&
        ['name', 'processedAt', 'originModificationDate'].includes(field.fileProperty || '')) ||
      field.sourceType === 'llm_computed'
    )
  }

  const handleAddField = () => {
    setEditField(null)
    setIsFieldModalOpen(true)
  }

  const handleEditField = (fieldData: FieldModal_EditableFieldFragment) => {
    setEditField(fieldData)
    setIsFieldModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsFieldModalOpen(false)
    setEditField(null)
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
      const currentWidth = (columnWidthsRef.current && columnWidthsRef.current[columnId]) || 150
      startWidthRef.current = currentWidth

      const handleMouseMove = (e: MouseEvent) => {
        if (!resizingColumnRef.current) return

        const diff = e.clientX - startXRef.current
        const newWidth = Math.max(60, startWidthRef.current + diff) // Minimum width of 60px

        setColumnWidths((prev) => ({
          ...prev,
          [resizingColumnRef.current!]: newWidth,
        }))
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
    [setColumnWidths],
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
                checked={fieldVisibility?.[field.id] ?? true}
                onChange={() => toggleFieldVisibility(field.id)}
              />
              {field.name}
            </label>
          ))}
        </div>

        {/* Pagination with page size selector */}
        <Pagination
          totalItems={listFiles.count}
          itemsPerPage={pageSize}
          currentPage={currentPage + 1} // Convert from 0-based to 1-based
          onPageChange={(page) => onPageChange?.(page - 1, pageSize, sortBy, sortDirection)} // Convert back to 0-based
          showPageSizeSelector={true}
          onPageSizeChange={(newPageSize) => onPageChange?.(0, newPageSize, sortBy, sortDirection)}
        />
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto">
        <div
          className="border-base-300 grid"
          style={{
            gridTemplateColumns: `${visibleFieldsArray.map((field) => `${(columnWidths && columnWidths[field.id]) || 150}px`).join(' ')} 60px`,
          }}
        >
          {/* Header Row */}
          {visibleFieldsArray.map((field) => (
            <div
              key={`header-${field.id}`}
              className="border-base-300 bg-base-200 group relative border-b border-r text-sm"
              style={{
                minWidth: `${(columnWidths && columnWidths[field.id]) || 150}px`,
                width: `${(columnWidths && columnWidths[field.id]) || 150}px`,
              }}
            >
              <div className="space-y-2 p-2">
                {/* Field header with sorting and dropdown */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex flex-1 items-center gap-1 overflow-hidden whitespace-nowrap text-nowrap hover:overflow-visible">
                    {isSortable(field) ? (
                      <button
                        type="button"
                        className="hover:text-primary flex items-center gap-1"
                        onClick={() => handleSort(field.id)}
                      >
                        {field.name}
                        {((field.sourceType === 'file_property' && sortBy === field.fileProperty) ||
                          (field.sourceType === 'llm_computed' && sortBy === field.id)) && (
                          <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    ) : (
                      <span>{field.name}</span>
                    )}

                    {(field.pendingItemsCount > 0 || field.processingItemsCount > 0) && (
                      <div className="flex items-center gap-2">
                        <div className="loading loading-ring text-primary"></div>
                      </div>
                    )}
                  </div>

                  {/* Field dropdown trigger */}
                  <div className="relative">
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFieldDropdownOpen(fieldDropdownOpen === field.id ? null : field.id)
                      }}
                    >
                      <MenuEllipsisIcon />
                    </button>

                    {/* Field dropdown */}
                    <FieldHeaderDropdown
                      field={field}
                      isOpen={fieldDropdownOpen === field.id}
                      onClose={() => setFieldDropdownOpen(null)}
                      onEdit={handleEditField}
                    />
                  </div>
                </div>
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

          {/* Add Field Header */}
          <div className="border-base-300 bg-base-200 relative flex items-center justify-center border-b border-r text-sm">
            <button
              type="button"
              className="btn btn-ghost btn-sm h-full w-full rounded-none"
              onClick={handleAddField}
              title="Add enrichment field"
            >
              <PlusIcon />
            </button>
          </div>

          {/* Data Rows */}
          {listFiles.files.length === 0 ? (
            <div
              className="border-base-300 border-b border-r p-8 text-center"
              style={{ gridColumn: `1 / ${visibleFieldsArray.length + 2}` }}
            >
              {t('lists.files.noFiles')}
            </div>
          ) : (
            listFiles.files.map((file) =>
              visibleFieldsArray
                .map((field) => {
                  const { value, error, queueStatus } = getFieldData(file.id, field.id)
                  const displayValue = value?.toString() || '-'

                  return (
                    <div
                      key={`${file.id}-${field.id}`}
                      className="border-base-300 hover:bg-base-100 border-b border-r p-2 text-sm"
                      style={{
                        minWidth: `${(columnWidths && columnWidths[field.id]) || 150}px`,
                        width: `${(columnWidths && columnWidths[field.id]) || 150}px`,
                      }}
                    >
                      {field.sourceType === 'llm_computed' ? (
                        <div className="group relative flex items-center gap-1">
                          <span
                            id={`${file.id}-${field.id}`}
                            className={twMerge(
                              'flex-1 overflow-hidden text-nowrap',
                              !value && error && 'text-error text-xs',
                              !value && !error && queueStatus && 'text-info text-xs',
                              !value && !error && !queueStatus && 'text-base-content/40 text-xs italic',
                            )}
                            title={error || queueStatus || displayValue}
                          >
                            {error
                              ? `❌ ${error}`
                              : value
                                ? displayValue
                                : queueStatus
                                  ? queueStatus === 'processing'
                                    ? '⚙️ processing...'
                                    : '⏳ pending...'
                                  : t('lists.enrichment.notEnriched')}
                          </span>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation()
                              const itemKey = `${file.id}-${field.id}`
                              setItemDropdownOpen(itemDropdownOpen === itemKey ? null : itemKey)
                            }}
                          >
                            <MenuEllipsisIcon className="size-4" />
                          </button>
                          <FieldItemDropdown
                            listId={list.id}
                            fieldId={field.id}
                            fileId={file.id}
                            fieldName={field.name}
                            fileName={file.name}
                            isOpen={itemDropdownOpen === `${file.id}-${field.id}`}
                            onClose={() => setItemDropdownOpen(null)}
                            queueStatus={queueStatus}
                          />
                        </div>
                      ) : field.fileProperty === 'name' ? (
                        <Link
                          to="/libraries/$libraryId/files/$fileId"
                          params={{
                            libraryId: file.libraryId,
                            fileId: file.id,
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
                        <div id={`${file.id}-${field.id}`} className="overflow-hidden text-nowrap" title={displayValue}>
                          {displayValue}
                        </div>
                      )}
                    </div>
                  )
                })
                .concat(
                  // Add empty cell for "Add Field" column
                  <div
                    key={`${file.id}-add-field`}
                    className="border-base-300 border-b border-r"
                    style={{ width: '60px', minWidth: '60px' }}
                  />,
                ),
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

      {/* Field Modal (Add/Edit) */}
      <FieldModal
        list={list}
        isOpen={isFieldModalOpen}
        onClose={handleCloseModal}
        maxOrder={Math.max(0, ...sortedFields.map((f) => f.order))}
        editField={editField}
      />
    </div>
  )
}
