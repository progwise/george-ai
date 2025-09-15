import { useCallback, useEffect, useMemo, useRef } from 'react'

import { graphql } from '../../gql'
import { ListFieldsTableMenu_AiListFieldFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { ListFieldsTableFilterEdit } from './list-fields-table-filter-edit'

graphql(`
  fragment ListFieldsTableMenu_AiListField on AiListField {
    id
    name
    type
  }
`)

interface ListFieldsTableMenuProps {
  listId: string
  fields: (ListFieldsTableMenu_AiListFieldFragment & { visible: boolean })[]
  onVisibilityChange: (fieldId: string, visible: boolean) => void
}

export const ListFieldsTableMenu = (props: ListFieldsTableMenuProps) => {
  const detailsRef = useRef<HTMLDetailsElement | null>(null)
  const { listId, fields, onVisibilityChange } = props
  const { t } = useTranslation()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
        detailsRef.current.open = false
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const visibleFields = useMemo(() => fields.filter((f) => f.visible).map((f) => f.id), [fields])
  const isVisible = useCallback(
    (fieldId: string) => {
      return visibleFields.includes(fieldId)
    },
    [visibleFields],
  )
  return (
    <ul className="menu menu-horizontal menu-sm rounded-box bg-base-200 z-48 items-center gap-2 p-2 text-sm">
      <li>
        <details ref={detailsRef}>
          <summary className="btn btn-sm">
            {t('lists.files.showColumns', { total: fields.length, count: visibleFields.length })}
          </summary>
          <ul className="w-60">
            {fields.map((field) => (
              <li key={field.id}>
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={isVisible(field.id)}
                    onChange={() => onVisibilityChange(field.id, !isVisible(field.id))}
                  />
                  {field.name}
                </label>
              </li>
            ))}
          </ul>
        </details>
      </li>
      <li>
        <ListFieldsTableFilterEdit listId={listId} fields={fields} />
      </li>
    </ul>
  )
}
