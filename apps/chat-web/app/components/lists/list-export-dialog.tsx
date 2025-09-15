import { useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { graphql } from '../../gql'
// NOTE: Field value computation is now centralized in pothos-graphql/utils/field-value-resolver.ts
// We now use the GraphQL fieldValues field to get all values at once
import { useTranslation } from '../../i18n/use-translation-hook'
import { toastSuccess } from '../georgeToaster'
import { getListExportData, getListExportDataOptions } from './server-functions'

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

interface ListExportDialogProps {
  listId: string
  ref: React.RefObject<HTMLDialogElement | null>
}

export const ListExportDialog = ({ listId, ref }: ListExportDialogProps) => {
  const { t } = useTranslation()
  const [isExporting, setIsExporting] = useState(false)
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([])
  const [maxRows, setMaxRows] = useState(1000)

  // First fetch just the list info to get fields and total count
  const {
    data: { aiList, aiListItems },
  } = useSuspenseQuery(getListExportDataOptions(listId, 0, 0, []))

  const handleExport = async () => {
    if (isExporting) return

    try {
      setIsExporting(true)

      // Get all fields and filter by selected ones
      const allFields = [...(aiList.fields || [])].sort((a, b) => a.order - b.order)
      const selectedFields = allFields.filter((field) => selectedFieldIds.includes(field.id))

      if (selectedFields.length === 0) {
        toastSuccess(t('lists.export.noFieldsSelected'))
        return
      }

      // Fetch data with field values
      const exportData = await getListExportData({
        data: {
          listId,
          skip: 0,
          take: maxRows,
          fieldIds: selectedFieldIds,
        },
      })

      const itemsToExport = exportData.aiListItems.items

      // Generate CSV header
      const headers = selectedFields.map((field) => field.name)
      const csvRows = [headers.join(',')]

      // Generate CSV data rows
      itemsToExport.forEach((item) => {
        const rowData = selectedFieldIds.map((fieldId) => {
          const fieldValue = item.values.find((fv: { fieldId: string }) => fv.fieldId === fieldId)
          const value = fieldValue?.displayValue || ''

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

      // Delay revoking the URL to ensure all browsers have time to start the download
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 100)

      toastSuccess(t('lists.export.success', { name: aiList.name }))
    } catch (error) {
      console.error('Export failed:', error)
      toastSuccess(t('lists.export.error'))
    } finally {
      setIsExporting(false)
    }
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
    <dialog className="modal" ref={ref}>
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
            {t('lists.export.dialog.totalFiles', { count: aiListItems.count })}
          </div>
        </div>

        {/* Dialog Actions */}
        <div className="modal-action">
          <button type="button" className="btn btn-ghost" disabled={isExporting} onClick={() => ref.current?.close()}>
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
      <form method="dialog" className="modal-backdrop">
        <button type="submit">Close</button>
      </form>
    </dialog>
  )
}
