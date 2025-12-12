import { useEffect, useRef } from 'react'

import { graphql } from '../../gql'
import { ListFieldsTableMenu_AiListFragment, ListFieldsTableMenu_FieldFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { ListFieldsTableFilterEdit } from './list-fields-table-filter-edit'
import { useFieldSettings } from './use-field-settings'

graphql(`
  fragment ListFieldsTableMenu_AiList on AiList {
    id
    name
  }
`)

graphql(`
  fragment ListFieldsTableMenu_Field on AiListField {
    id
    name
    type
    ...ListFieldSettings_Field
  }
`)

interface ListFieldsTableMenuProps {
  list: ListFieldsTableMenu_AiListFragment
  fields: ListFieldsTableMenu_FieldFragment[]
  unfilteredCount?: number
}

export const ListFieldsTableMenu = (props: ListFieldsTableMenuProps) => {
  const detailsRef = useRef<HTMLDetailsElement | null>(null)
  const { list, fields } = props
  const { t } = useTranslation()

  const { setFieldVisibility, visibleFields } = useFieldSettings(fields)

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

  return (
    <ul className="menu menu-horizontal z-48 items-center gap-2 menu-sm rounded-box bg-base-200 p-2 text-sm">
      <li className="menu-title pr-2">
        {props.unfilteredCount !== undefined && (
          <span className="text-sm text-base-content/50">
            {props.unfilteredCount}{' '}
            {props.unfilteredCount === 1 ? t('lists.elementCount') : t('lists.elementsCount')}{' '}
          </span>
        )}
      </li>
      <li>
        <details ref={detailsRef}>
          <summary className="btn btn-sm">
            {t('lists.files.showColumns', { total: fields.length, count: visibleFields.length })}
          </summary>
          <ul className="flex w-60 flex-col gap-2">
            {fields
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((field) => (
                <li key={field.id} className="">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={visibleFields.some((f) => f.id === field.id)}
                      onChange={() =>
                        setFieldVisibility((prev) => ({
                          ...prev,
                          [field.id]: !prev ? false : !prev[field.id],
                        }))
                      }
                    />
                    <span>{field.name}</span>
                  </label>
                </li>
              ))}
          </ul>
        </details>
      </li>
      <li>
        <ListFieldsTableFilterEdit listId={list.id} fields={fields} />
      </li>
    </ul>
  )
}
