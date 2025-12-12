import { useEffect, useRef } from 'react'

import { graphql } from '../../gql'
import { ListFieldsTableFilters_AiListFieldFragment } from '../../gql/graphql'
import { FilterIcon } from '../../icons/filter-icon'
import { FieldFilterType, useListSettings } from './use-list-settings'

graphql(`
  fragment ListFieldsTableFilters_AiListField on AiListField {
    id
    name
    type
  }
`)

interface ListFieldsTableFilterEditProps {
  listId: string
  fields: ListFieldsTableFilters_AiListFieldFragment[]
}

const FilterValueInput = ({
  type,
  value,
  update,
  remove,
}: {
  field: ListFieldsTableFilters_AiListFieldFragment
  type: FieldFilterType
  value?: string | null
  update: (value: string) => void
  remove: () => void
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  if (type === 'is_empty' || type === 'is_not_empty') {
    return (
      <div>
        <label className="label cursor-pointer">
          <span>{type === 'is_empty' ? 'Is empty' : 'Is not empty'}</span>
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={!!value}
            onChange={(e) => {
              if (e.target.checked) {
                update('1')
              } else {
                remove()
              }
            }}
          />
        </label>
      </div>
    )
  }
  return (
    <label className="input input-xs">
      {type === 'contains' ? 'Contains' : 'Contains not'}
      <input
        ref={inputRef}
        type="text"
        className="grow"
        placeholder="xyz"
        defaultValue={value || ''}
        onMouseOut={() => {}}
      />
      <button
        type="button"
        className="ml-2 badge badge-xs hover:badge-primary"
        onClick={() => {
          const newValue = inputRef.current?.value || ''
          if (newValue.length === 0) {
            remove()
          } else {
            update(newValue)
          }
        }}
      >
        Apply
      </button>
    </label>
  )
}

export const ListFieldsTableFilterEdit = ({ listId, fields }: ListFieldsTableFilterEditProps) => {
  const detailsRef = useRef<HTMLDetailsElement | null>(null)

  const { getFilterValue, updateFilter, removeFilter, clearFieldFilters } = useListSettings(listId)

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

  const handleUpdateFilterClick = (...args: Parameters<typeof updateFilter>) => {
    updateFilter(...args)
    if (detailsRef.current) {
      detailsRef.current.open = false
    }
  }

  const handleRemoveFilterClick = (...args: Parameters<typeof removeFilter>) => {
    removeFilter(...args)
    if (detailsRef.current) {
      detailsRef.current.open = false
    }
  }

  const handleClearFieldFiltersClick = (...args: Parameters<typeof clearFieldFilters>) => {
    clearFieldFilters(...args)
    if (detailsRef.current) {
      detailsRef.current.open = false
    }
  }

  return (
    <details ref={detailsRef}>
      <summary className="btn btn-sm">
        <FilterIcon className="size-4" />
        Filters
      </summary>
      <ul>
        {fields.map((field) => (
          <li key={field.id}>
            <div className="dropdown-hover dropdown dropdown-right dropdown-center">
              <div tabIndex={0} role="button" className="btn w-full justify-start text-nowrap btn-ghost btn-xs">
                {field.name}
              </div>
              <div tabIndex={-1} className="dropdown-content z-10 w-64 rounded-box bg-base-300 shadow-md card-xs">
                <div className="card-title flex justify-between px-4 pt-2">
                  <div>{field.name}</div>
                  <div>
                    <button
                      type="button"
                      className="btn btn-xs btn-secondary"
                      onClick={() => handleClearFieldFiltersClick(field.id)}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <FilterValueInput
                    field={field}
                    type="contains"
                    value={getFilterValue(field.id, 'contains')}
                    update={(newValue: string) =>
                      handleUpdateFilterClick({ fieldId: field.id, filterType: 'contains', value: newValue })
                    }
                    remove={() => handleRemoveFilterClick(field.id, 'contains')}
                  />
                  <FilterValueInput
                    field={field}
                    type="not_contains"
                    value={getFilterValue(field.id, 'not_contains')}
                    update={(newValue: string) =>
                      handleUpdateFilterClick({ fieldId: field.id, filterType: 'not_contains', value: newValue })
                    }
                    remove={() => handleRemoveFilterClick(field.id, 'not_contains')}
                  />
                  <FilterValueInput
                    field={field}
                    type="is_empty"
                    value={getFilterValue(field.id, 'is_empty') || undefined}
                    update={() => handleUpdateFilterClick({ fieldId: field.id, filterType: 'is_empty', value: '1' })}
                    remove={() => handleRemoveFilterClick(field.id, 'is_empty')}
                  />
                  <FilterValueInput
                    field={field}
                    type="is_not_empty"
                    value={getFilterValue(field.id, 'is_not_empty') || undefined}
                    update={() =>
                      handleUpdateFilterClick({ fieldId: field.id, filterType: 'is_not_empty', value: '1' })
                    }
                    remove={() => handleRemoveFilterClick(field.id, 'is_not_empty')}
                  />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </details>
  )
}
