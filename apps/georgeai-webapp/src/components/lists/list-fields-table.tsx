import { Link } from '@tanstack/react-router'
import { useCallback, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { graphql } from '../../gql'
import {
  EnrichmentSidePanel_FieldValueFragment,
  EnrichmentSidePanel_OriginFragment,
  FieldModal_FieldFragment,
  ListFieldsTable_ListFragment,
  ListFilesTable_FilesQueryResultFragment,
} from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { EyeIcon } from '../../icons/eye-icon'
import { MenuEllipsisIcon } from '../../icons/menu-ellipsis-icon'
import { PlusIcon } from '../../icons/plus-icon'
import { SortingIcon } from '../../icons/sorting-icon'
import { EnrichmentSidePanel } from './enrichment-side-panel'
import { FieldHeaderDropdown } from './field-header-dropdown'
import { FieldItemDropdown } from './field-item-dropdown'
import { FieldModal } from './field-modal'
import { ItemDetailSidePanel } from './item-detail-side-panel'
import { useFieldSettings } from './use-field-settings'
import { useListActions } from './use-list-actions'
import { useListSettings } from './use-list-settings'

// Note: We can't use variables in fragments, so fieldValues will be queried separately
graphql(`
  fragment ListFilesTable_FilesQueryResult on ListItemsQueryResult {
    count
    take
    skip
    items {
      id
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
        fieldType
        displayValue
        enrichmentErrorMessage
        failedEnrichmentValue
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
  const fieldModalDialogRef = useRef<HTMLDialogElement>(null)
  const {
    visibleFields,
    isResizing,
    isOrdering,
    handleResizeMouseDown,
    handleDragOver,
    handleDrop,
    handleDragStart,
    handleDragEnd,
    columnWidths,
  } = useFieldSettings(list.fields || [])

  const { getSortingDirection, toggleSorting } = useListSettings(list.id)
  const { reorderFields } = useListActions(list.id)

  const [editField, setEditField] = useState<FieldModal_FieldFragment | null>(null)
  const [fieldDropdownOpen, setFieldDropdownOpen] = useState<string | null>(null)
  const [itemDropdownOpen, setItemDropdownOpen] = useState<string | null>(null)
  const [sidePanelData, setSidePanelData] = useState<{
    fieldValue: EnrichmentSidePanel_FieldValueFragment
    origin: EnrichmentSidePanel_OriginFragment
  } | null>(null)
  const [itemDetailData, setItemDetailData] = useState<{
    itemId: string
    itemName: string
    fileName: string
    libraryId: string
    fileId: string
  } | null>(null)

  // Helper to get field value and error from the fetched data
  const getFieldData = useCallback(
    (
      itemId: string,
      fieldId: string,
    ): {
      value: string | null
      error: string | null
      failedEnrichmentValue: string | null
      queueStatus: string | null
    } => {
      if (!listItems) return { value: null, error: null, failedEnrichmentValue: null, queueStatus: null }

      // Use item.id (list item ID), not origin.id (file ID) - important for per_row extraction
      // where multiple items share the same source file
      const items = listItems.items.find((item) => item.id === itemId)
      if (!items) return { value: null, error: null, failedEnrichmentValue: null, queueStatus: null }

      const fieldValue = items.values.find((fv: { fieldId: string }) => fv.fieldId === fieldId)
      return {
        value: fieldValue?.displayValue || null,
        error: fieldValue?.enrichmentErrorMessage || null,
        failedEnrichmentValue: fieldValue?.failedEnrichmentValue || null,
        queueStatus: fieldValue?.queueStatus || null,
      }
    },
    [listItems],
  )

  const handleAddField = () => {
    setEditField(null)
    fieldModalDialogRef.current?.showModal()
  }

  const handleEditField = (fieldData: FieldModal_FieldFragment) => {
    setEditField(fieldData)
    fieldModalDialogRef.current?.showModal()
  }

  const handleFieldReorder = (targetFieldId: string, event: React.DragEvent) => {
    const dropResult = handleDrop(targetFieldId, event)
    if (dropResult) {
      reorderFields({
        fieldId: dropResult.draggedFieldId,
        newPlace: dropResult.newOrder,
      })
    }
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
                    opacity: isOrdering === field.id ? 0.5 : 1,
                  }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleFieldReorder(field.id, e)}
                >
                  <div
                    className="absolute left-1 top-2.5 h-full w-2 cursor-grab transition-colors before:content-['⋮⋮']"
                    draggable={true}
                    onDragStart={(e) => handleDragStart(field.id, e)}
                    onDragEnd={handleDragEnd}
                  ></div>

                  <div className="space-y-2 p-2">
                    {/* Field header with sorting and dropdown */}
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex flex-1 items-center gap-1 overflow-hidden whitespace-nowrap text-nowrap pl-2 hover:overflow-visible">
                        {visibleFields.find((sortableField) => sortableField.id === field.id) ? (
                          <button
                            type="button"
                            className="hover:text-primary flex items-center gap-1"
                            aria-label={`Sort by ${field.name}`}
                            onClick={() => toggleSorting(field.id)}
                          >
                            {field.name}
                            <span className="text-xs">
                              <SortingIcon direction={getSortingDirection(field.id)} />
                            </span>
                          </button>
                        ) : (
                          <span aria-label={`Field column ${field.name}`}>{field.name}</span>
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
                          aria-label={`Field actions for ${field.name}`}
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
                    onMouseDown={(e) => handleResizeMouseDown(field.id, e)}
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
                    const { value, error, failedEnrichmentValue, queueStatus } = getFieldData(item.id, field.id)
                    const displayValue = value?.toString() || '-'
                    const fieldValueData = item.values.find((v) => v.fieldId === field.id)

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
                                queueStatus === 'processing' && 'text-info text-xs',
                                queueStatus === 'pending' && 'text-info text-xs',
                                queueStatus !== 'processing' &&
                                  queueStatus !== 'pending' &&
                                  !value &&
                                  error &&
                                  'text-error text-xs',
                                queueStatus !== 'processing' &&
                                  queueStatus !== 'pending' &&
                                  !value &&
                                  !error &&
                                  failedEnrichmentValue &&
                                  'text-warning text-xs',
                                queueStatus !== 'processing' &&
                                  queueStatus !== 'pending' &&
                                  !value &&
                                  !error &&
                                  !failedEnrichmentValue &&
                                  'text-base-content/40 text-xs italic',
                              )}
                              title={error || failedEnrichmentValue || queueStatus || displayValue}
                            >
                              {queueStatus === 'processing'
                                ? '⚙️ processing...'
                                : queueStatus === 'pending'
                                  ? '⏳ pending...'
                                  : error
                                    ? `❌ ${t('lists.enrichment.error')}`
                                    : value
                                      ? displayValue
                                      : failedEnrichmentValue
                                        ? `⚠️ ${t('lists.enrichment.failedTerm')}`
                                        : t('lists.enrichment.notEnriched')}
                            </span>
                            {fieldValueData && (value || error || failedEnrichmentValue) && (
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs opacity-0 transition-opacity group-hover:opacity-100"
                                aria-label={t('lists.enrichment.sidePanel.viewDetails')}
                                title={t('lists.enrichment.sidePanel.viewDetails')}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSidePanelData({
                                    fieldValue: fieldValueData,
                                    origin: item.origin,
                                  })
                                }}
                              >
                                <EyeIcon className="size-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs opacity-0 transition-opacity group-hover:opacity-100"
                              aria-label={`Actions for ${field.name} in ${item.origin.name}`}
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
                              itemId={item.id}
                              fieldName={field.name}
                              fileName={item.origin.name}
                              isOpen={itemDropdownOpen === `${item.origin.id}-${field.id}`}
                              onClose={() => setItemDropdownOpen(null)}
                              queueStatus={queueStatus}
                              error={error}
                              failedEnrichmentValue={failedEnrichmentValue}
                              value={value}
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
                        ) : field.fileProperty === 'itemName' ? (
                          <div className="group flex items-center gap-1">
                            <span className="flex-1 overflow-hidden text-nowrap" title={displayValue}>
                              {displayValue}
                            </span>
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs opacity-0 transition-opacity group-hover:opacity-100"
                              aria-label={t('lists.itemDetail.viewDetails')}
                              title={t('lists.itemDetail.viewDetails')}
                              onClick={(e) => {
                                e.stopPropagation()
                                setItemDetailData({
                                  itemId: item.id,
                                  itemName: displayValue,
                                  fileName: item.origin.name,
                                  libraryId: item.origin.libraryId,
                                  fileId: item.origin.id,
                                })
                              }}
                            >
                              <EyeIcon className="size-4" />
                            </button>
                          </div>
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
        ref={fieldModalDialogRef}
        maxOrder={Math.max(0, ...visibleFields.map((f) => f.order))}
        editField={editField}
      />

      {/* Enrichment Side Panel */}
      {sidePanelData && (
        <EnrichmentSidePanel
          isOpen={!!sidePanelData}
          onClose={() => setSidePanelData(null)}
          listId={list.id}
          fieldValue={sidePanelData.fieldValue}
          origin={sidePanelData.origin}
        />
      )}

      {/* Item Detail Side Panel */}
      {itemDetailData && (
        <ItemDetailSidePanel
          isOpen={!!itemDetailData}
          onClose={() => setItemDetailData(null)}
          itemId={itemDetailData.itemId}
          itemName={itemDetailData.itemName}
          fileName={itemDetailData.fileName}
          libraryId={itemDetailData.libraryId}
          fileId={itemDetailData.fileId}
        />
      )}
    </div>
  )
}
