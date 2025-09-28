import { useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { graphql } from '../../gql'
import { ListFieldsTableFilters_AiListFieldFragment } from '../../gql/graphql'
import { PlusIcon } from '../../icons/plus-icon'
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
      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">{type === 'is_empty' ? 'Is empty' : 'Is not empty'}</span>
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
        className={twMerge(
          'badge badge-xs hover:badge-primary ml-2',
          (!value || value.length === 0) && 'badge-disabled',
        )}
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
  const { getFilterValue, updateFilter, removeFilter, clearFieldFilters } = useListSettings(listId)

  return (
    <div className="dropdown dropdown-bottom flex text-sm">
      <button type="button" tabIndex={0} className="btn btn-sm p-0" role="button">
        <PlusIcon className="size-4" />
        Filters
      </button>
      <div className="dropdown-content bg-base-200 rounded-box z-10 flex flex-col gap-1 py-2 shadow-sm">
        {fields.map((field) => (
          <div key={field.id} className="dropdown dropdown-hover dropdown-center dropdown-right">
            <div
              tabIndex={0}
              className="hover:bg-base-300 flex cursor-pointer flex-row flex-nowrap justify-between gap-8 py-2 pl-6 pr-4 text-sm"
              role="button"
            >
              <span className="text-nowrap">{field.name}</span>
              <span> &gt;</span>
            </div>
            <div className="dropdown-content bg-base-300 rounded-box card card-xs z-10 w-64 shadow-md">
              <div className="card-title flex justify-between px-4 pt-2">
                <div>{field.name}</div>
                <div>
                  <button
                    type="button"
                    className="btn btn-xs btn-secondary"
                    onClick={() => clearFieldFilters(field.id)}
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
                    updateFilter({ fieldId: field.id, filterType: 'contains', value: newValue })
                  }
                  remove={() => removeFilter(field.id, 'contains')}
                />
                <FilterValueInput
                  field={field}
                  type="not_contains"
                  value={getFilterValue(field.id, 'not_contains')}
                  update={(newValue: string) =>
                    updateFilter({ fieldId: field.id, filterType: 'not_contains', value: newValue })
                  }
                  remove={() => removeFilter(field.id, 'not_contains')}
                />
                <FilterValueInput
                  field={field}
                  type="is_empty"
                  value={getFilterValue(field.id, 'is_empty') || undefined}
                  update={() => updateFilter({ fieldId: field.id, filterType: 'is_empty', value: '1' })}
                  remove={() => removeFilter(field.id, 'is_empty')}
                />
                <FilterValueInput
                  field={field}
                  type="is_not_empty"
                  value={getFilterValue(field.id, 'is_not_empty') || undefined}
                  update={() => updateFilter({ fieldId: field.id, filterType: 'is_not_empty', value: '1' })}
                  remove={() => removeFilter(field.id, 'is_not_empty')}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
