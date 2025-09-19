import { Link } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { graphql } from '../../gql'
import {
  FieldModal_FieldFragment,
  ListFieldsTable_ListFragment,
  ListFilesTable_FilesQueryResultFragment,
} from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { MenuEllipsisIcon } from '../../icons/menu-ellipsis-icon'
import { PlusIcon } from '../../icons/plus-icon'
import { SortingIcon } from '../../icons/sorting-icon'
import { FieldHeaderDropdown } from './field-header-dropdown'
import { FieldItemDropdown } from './field-item-dropdown'
import { FieldModal } from './field-modal'
import { useFieldSettings } from './use-field-settings'
import { useListSettings } from './use-list-settings'

// Note: We can't use variables in fragments, so fieldValues will be queried separately
graphql(`
  fragment ListFilesTable_FilesQueryResult on ListItemsQueryResult {
    count
    take
    skip
    items {
      origin {
        id
        type
        name
        libraryId
        libraryName
      }
      values {
        fieldId
        fieldName
        displayValue
        enrichmentErrorMessage
        queueStatus
      }
    }
  }
`)

graphql(`
  fragment ListFieldsTable_List on AiList {
    id
    fields {
      ...ListFieldsTable_Field
    }
    ...FieldModal_List
  }
`)

graphql(`
  fragment ListFieldsTable_Field on AiListField {
    listId
    processingItemsCount
    pendingItemsCount
    id
    sourceType
    fileProperty
    ...FieldModal_Field
  }
`)

interface ListFieldsTableProps {
  list: ListFieldsTable_ListFragment
  listItems: ListFilesTable_FilesQueryResultFragment
}

export const ListFieldsTable = ({ list, listItems }: ListFieldsTableProps) => {
  const { t } = useTranslation()

  const { visibleFields, sortableFields, isResizing, handleMouseDown, columnWidths } = useFieldSettings(
    list.fields || [],
  )

  const { getSortingDirection, toggleSorting } = useListSettings(list.id)

  const { isReordering } = { isReordering: '' } // Placeholder for future drag-and-drop reordering feature
  // Check if there are any active enrichments (pending or processing)

  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false)
  const [editField, setEditField] = useState<FieldModal_FieldFragment | null>(null)
  const [fieldDropdownOpen, setFieldDropdownOpen] = useState<string | null>(null)
  const [itemDropdownOpen, setItemDropdownOpen] = useState<string | null>(null)

  // Helper to get field value and error from the fetched data
  const getFieldData = useCallback(
    (fileId: string, fieldId: string): { value: string | null; error: string | null; queueStatus: string | null } => {
      if (!listItems) return { value: null, error: null, queueStatus: null }

      const items = listItems.items.find((item) => item.origin.id === fileId)
      if (!items) return { value: null, error: null, queueStatus: null }

      const fieldValue = items.values.find((fv: { fieldId: string }) => fv.fieldId === fieldId)
      return {
        value: fieldValue?.displayValue || null,
        error: fieldValue?.enrichmentErrorMessage || null,
        queueStatus: fieldValue?.queueStatus || null,
      }
    },
    [listItems],
  )

  const handleAddField = () => {
    setEditField(null)
    setIsFieldModalOpen(true)
  }

  const handleEditField = (fieldData: FieldModal_FieldFragment) => {
    setEditField(fieldData)
    setIsFieldModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsFieldModalOpen(false)
    setEditField(null)
  }

  return (
    <div>
      {listItems.count === 0 ? (
        <div className="border-base-300 bg-base-200 text-base-content/70 rounded-lg border p-4 text-center text-sm">
          {t('lists.noFilesFound')}
          <Link to="/lists/$listId/edit" params={{ listId: list.id }} className="link link-primary ml-1">
            {t('lists.edit')}
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <div
              className="border-base-300 grid"
              style={{
                gridTemplateColumns: `${visibleFields.map((field) => `${(columnWidths && columnWidths[field.id]) || 150}px`).join(' ')} 60px`,
              }}
            >
              {/* Header Row */}
              {visibleFields.map((field) => (
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
                      <div
                        className="hover:bg-primary/30 absolute left-1 top-2.5 h-full w-2 cursor-grabbing transition-colors before:content-['⋮⋮']"
                        style={{
                          backgroundColor: isReordering === field.id ? 'rgba(59, 130, 246, 0.5)' : 'transparent',
                          right: '-1px',
                        }}
                      ></div>
                      <div className="flex flex-1 items-center gap-1 overflow-hidden whitespace-nowrap text-nowrap pl-2 hover:overflow-visible">
                        {sortableFields.find((sortableField) => sortableField.id === field.id) ? (
                          <button
                            type="button"
                            className="hover:text-primary flex items-center gap-1"
                            onClick={() => toggleSorting(field.id)}
                          >
                            {field.name}
                            <span className="text-xs">
                              <SortingIcon direction={getSortingDirection(field.id)} />
                            </span>
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
              {listItems.items.map((item) =>
                visibleFields
                  .map((field) => {
                    const { value, error, queueStatus } = getFieldData(item.origin.id, field.id)
                    const displayValue = value?.toString() || '-'

                    return (
                      <div
                        key={`${item.origin.id}-${field.id}`}
                        className="border-base-300 hover:bg-base-100 border-b border-r p-2 text-sm"
                        style={{
                          minWidth: `${(columnWidths && columnWidths[field.id]) || 150}px`,
                          width: `${(columnWidths && columnWidths[field.id]) || 150}px`,
                        }}
                      >
                        {field.sourceType === 'llm_computed' ? (
                          <div className="group relative flex items-center gap-1">
                            <span
                              id={`${item.origin.id}-${field.id}`}
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
                                const itemKey = `${item.origin.id}-${field.id}`
                                setItemDropdownOpen(itemDropdownOpen === itemKey ? null : itemKey)
                              }}
                            >
                              <MenuEllipsisIcon className="size-4" />
                            </button>
                            <FieldItemDropdown
                              listId={list.id}
                              fieldId={field.id}
                              fileId={item.origin.id}
                              fieldName={field.name}
                              fileName={item.origin.name}
                              isOpen={itemDropdownOpen === `${item.origin.id}-${field.id}`}
                              onClose={() => setItemDropdownOpen(null)}
                              queueStatus={queueStatus}
                            />
                          </div>
                        ) : field.fileProperty === 'name' ? (
                          <Link
                            to="/libraries/$libraryId/files/$fileId"
                            params={{
                              libraryId: item.origin.libraryId,
                              fileId: item.origin.id,
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
                        ) : field.fileProperty === 'source' ? (
                          <Link
                            to="/libraries/$libraryId"
                            params={{
                              libraryId: item.origin.libraryId,
                            }}
                            className="link link-primary block overflow-hidden text-nowrap"
                            title={displayValue}
                          >
                            {displayValue}
                          </Link>
                        ) : (
                          <div
                            id={`${item.origin.id}-${field.id}`}
                            className="overflow-hidden text-nowrap"
                            title={displayValue}
                          >
                            {displayValue}
                          </div>
                        )}
                      </div>
                    )
                  })
                  .concat(
                    // Add empty cell for "Add Field" column
                    <div
                      key={`${item.origin.id}-add-field`}
                      className="border-base-300 border-b border-r"
                      style={{ width: '60px', minWidth: '60px' }}
                    />,
                  ),
              )}
            </div>
          </div>
        </>
      )}

      {/* Field Modal (Add/Edit) */}
      <FieldModal
        list={list}
        isOpen={isFieldModalOpen}
        onClose={handleCloseModal}
        maxOrder={Math.max(0, ...visibleFields.map((f) => f.order))}
        editField={editField}
      />
    </div>
  )
}
