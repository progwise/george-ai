import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { graphql } from '../../gql'
import { ListFieldSettings_FieldFragment } from '../../gql/graphql'
import { useLocalstorage } from '../../hooks/use-local-storage'

graphql(`
  fragment ListFieldSettings_Field on AiListField {
    id
    order
    ...ListFieldsTable_Field
  }
`)

export const useFieldSettings = (fields: ListFieldSettings_FieldFragment[]) => {
  const [fieldVisibility, setFieldVisibility] = useLocalstorage<Record<string, boolean>>(
    'listFieldsTable-fieldVisibility',
  )

  const startXRef = useRef<number>(0)
  const startWidthRef = useRef<number>(0)
  const resizingColumnRef = useRef<string | null>(null)
  const columnWidthsRef = useRef<Record<string, number> | null>(null)
  const [columnWidths, setColumnWidths] = useLocalstorage<Record<string, number>>('listFieldsTable-columnWidths')

  // Keep column widths ref in sync
  columnWidthsRef.current = columnWidths
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [isOrdering, setIsOrdering] = useState<string | null>(null)

  // Ensure all fields have width values - only set defaults when needed
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setColumnWidths((prev) => {
        const newWidths = prev || {}
        let hasChanges = false

        fields.forEach((field) => {
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
  }, [fields])

  // Column resizing handlers
  const handleResizeMouseDown = useCallback(
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

  // Auto-show new fields when they're added
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFieldVisibility((prev) => {
        const newVisibility = prev || {}
        let hasChanges = false

        fields.forEach((field) => {
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
  }, [fields])

  // Sort fields by order for consistent display
  const visibleFields = useMemo(() => {
    if (!fieldVisibility) return fields
    const result = fields
      .filter((field) => (fieldVisibility ? fieldVisibility[field.id] !== false : true))
      .sort((a, b) => a.order - b.order)
    return result
  }, [fields, fieldVisibility])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDrop = useCallback(
    (targetFieldId: string, event: React.DragEvent) => {
      event.preventDefault()
      const draggedFieldId = event.dataTransfer.getData('fieldId')

      if (draggedFieldId && draggedFieldId !== targetFieldId) {
        const draggedField = fields.find((f) => f.id === draggedFieldId)
        const targetField = fields.find((f) => f.id === targetFieldId)

        if (draggedField && targetField) {
          // The onFieldReorder callback will be passed from the parent component
          return { draggedFieldId, targetFieldId, newOrder: targetField.order }
        }
      }

      return null
    },
    [fields],
  )

  const handleDragStart = useCallback((fieldId: string, event: React.DragEvent) => {
    event.dataTransfer.setData('fieldId', fieldId)
    event.dataTransfer.effectAllowed = 'move'
    setIsOrdering(fieldId)
  }, [])

  const handleDragEnd = useCallback(() => {
    setIsOrdering(null)
  }, [])

  return {
    fieldVisibility,
    setFieldVisibility,
    handleResizeMouseDown,
    handleDragOver,
    handleDrop,
    handleDragStart,
    handleDragEnd,
    isResizing,
    isOrdering,
    columnWidths,
    visibleFields,
  }
}
