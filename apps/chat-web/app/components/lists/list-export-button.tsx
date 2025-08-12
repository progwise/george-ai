import { useSuspenseQuery } from '@tanstack/react-query'
import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { z } from 'zod'

import { dateTimeString } from '@george-ai/web-utils'

import { graphql } from '../../gql'
import { ListExport_FieldFragment, ListExport_FileFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { DownloadIcon } from '../../icons/download-icon'
import { backendRequest } from '../../server-functions/backend'
import { toastSuccess } from '../georgeToaster'

// GraphQL fragments for export functionality
graphql(`
  fragment ListExport_File on AiLibraryFile {
    id
    name
    originUri
    mimeType
    size
    processedAt
    originModificationDate
    crawledByCrawler {
      id
      uri
    }
    cache {
      id
      fieldId
      valueString
      valueNumber
      valueDate
      valueBoolean
    }
  }
`)

graphql(`
  fragment ListExport_Field on AiListField {
    id
    name
    type
    order
    sourceType
    fileProperty
  }
`)

graphql(`
  fragment ListExport_List on AiList {
    id
    name
    fields {
      ...ListExport_Field
    }
  }
`)

// Query for export data
const exportDataDocument = graphql(`
  query ListExportData($listId: String!) {
    aiList(id: $listId) {
      ...ListExport_List
    }
    aiListFiles(listId: $listId, skip: 0, take: 10000, orderBy: "name", orderDirection: "asc") {
      files {
        ...ListExport_File
      }
    }
  }
`)

// Server function for getting export data
const getListExportData = createServerFn({ method: 'GET' })
  .validator(z.object({ listId: z.string() }))
  .handler(async (ctx) => {
    return await backendRequest(exportDataDocument, ctx.data)
  })

// Query options for export data
const getListExportDataOptions = (listId: string) =>
  queryOptions({
    queryKey: ['ListExportData', listId],
    queryFn: () => getListExportData({ data: { listId } }),
  })

interface ListExportButtonProps {
  listId: string
}

export const ListExportButton = ({ listId }: ListExportButtonProps) => {
  const { t, language } = useTranslation()
  const [isExporting, setIsExporting] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([])
  const [maxRows, setMaxRows] = useState(1000)

  const {
    data: { aiList, aiListFiles },
  } = useSuspenseQuery(getListExportDataOptions(listId))

  const handleOpenDialog = () => {
    // Initialize selected fields with all fields by default
    const sortedFields = [...(aiList.fields || [])].sort((a, b) => a.order - b.order)
    setSelectedFieldIds(sortedFields.map((field) => field.id))
    setShowDialog(true)
  }

  const handleExport = async () => {
    if (isExporting) return

    try {
      setIsExporting(true)
      setShowDialog(false)

      // Get all fields and filter by selected ones
      const allFields = [...(aiList.fields || [])].sort((a, b) => a.order - b.order)
      const selectedFields = allFields.filter((field) => selectedFieldIds.includes(field.id))

      if (selectedFields.length === 0) {
        toastSuccess(t('lists.export.noFieldsSelected'))
        return
      }

      // Limit the number of files to export
      const filesToExport = aiListFiles.files.slice(0, maxRows)

      // Generate CSV header
      const headers = selectedFields.map((field) => field.name)
      const csvRows = [headers.join(',')]

      // Generate CSV data rows
      filesToExport.forEach((file) => {
        const rowData = selectedFields.map((field) => {
          let value = getFieldValue(file, field)

          // Handle null/undefined values
          if (value === null || value === undefined) {
            value = ''
          }

          // Convert to string and escape CSV special characters
          const stringValue = String(value)

          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }

          return stringValue
        })

        csvRows.push(rowData.join(','))
      })

      // Create and download CSV file
      const csvContent = csvRows.join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

      // Create download link
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${aiList.name}-export.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toastSuccess(t('lists.export.success', { name: aiList.name }))
    } catch (error) {
      console.error('Export failed:', error)
      toastSuccess(t('lists.export.error'))
    } finally {
      setIsExporting(false)
    }
  }

  // Helper function to get field value
  const getFieldValue = (file: ListExport_FileFragment, field: ListExport_FieldFragment): string | number | null => {
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

    // For LLM computed fields, check cached values
    if (field.sourceType === 'llm_computed') {
      const cachedValue = file.cache?.find((cache: { fieldId: string }) => cache.fieldId === field.id)
      if (cachedValue) {
        switch (field.type) {
          case 'string':
            return cachedValue.valueString || null
          case 'number':
            return cachedValue.valueNumber ?? null
          case 'boolean':
            return cachedValue.valueBoolean ? 'Yes' : 'No'
          case 'date':
          case 'datetime':
            return cachedValue.valueDate ? dateTimeString(cachedValue.valueDate, language) : null
          default:
            return cachedValue.valueString || null
        }
      }
    }

    return null
  }

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFieldIds((prev) => (prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId]))
  }

  const handleSelectAll = () => {
    const sortedFields = [...(aiList.fields || [])].sort((a, b) => a.order - b.order)
    setSelectedFieldIds(sortedFields.map((field) => field.id))
  }

  const handleSelectNone = () => {
    setSelectedFieldIds([])
  }

  const sortedFields = [...(aiList.fields || [])].sort((a, b) => a.order - b.order)

  return (
    <>
      <button
        type="button"
        className="btn btn-sm"
        onClick={handleOpenDialog}
        disabled={isExporting || aiListFiles.files.length === 0}
        title={aiListFiles.files.length === 0 ? t('lists.export.noData') : t('lists.export.tooltip')}
      >
        {isExporting ? (
          <>
            <span className="loading loading-spinner loading-sm" />
            {t('lists.export.exporting')}
          </>
        ) : (
          <>
            <DownloadIcon className="size-4" />
            {t('lists.export.button')}
          </>
        )}
      </button>

      {/* Export Dialog */}
      {showDialog && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="mb-4 text-lg font-bold">{t('lists.export.dialog.title')}</h3>

            {/* Field Selection */}
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <label className="font-semibold">{t('lists.export.dialog.selectFields')}</label>
                <div className="space-x-2">
                  <button type="button" className="btn btn-xs btn-outline" onClick={handleSelectAll}>
                    {t('lists.export.dialog.selectAll')}
                  </button>
                  <button type="button" className="btn btn-xs btn-outline" onClick={handleSelectNone}>
                    {t('lists.export.dialog.selectNone')}
                  </button>
                </div>
              </div>
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {sortedFields.map((field) => (
                  <label key={field.id} className="flex cursor-pointer items-center space-x-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selectedFieldIds.includes(field.id)}
                      onChange={() => handleFieldToggle(field.id)}
                    />
                    <span className="text-sm">{field.name}</span>
                    <span className="text-base-content/60 text-xs">({field.sourceType})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Row Limit */}
            <div className="mb-6">
              <label className="mb-2 block font-semibold">{t('lists.export.dialog.maxRows')}</label>
              <input
                type="number"
                className="input input-sm input-bordered w-full"
                value={maxRows}
                onChange={(e) => setMaxRows(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                max={10000}
              />
              <div className="text-base-content/60 mt-1 text-xs">
                {t('lists.export.dialog.totalFiles', { count: aiListFiles.files.length })}
              </div>
            </div>

            {/* Dialog Actions */}
            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={() => setShowDialog(false)}>
                {t('actions.cancel')}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleExport}
                disabled={selectedFieldIds.length === 0 || isExporting}
              >
                {t('lists.export.dialog.export')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
