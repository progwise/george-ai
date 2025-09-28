import { ListFieldsTableFilters_AiListFieldFragment } from '../../gql/graphql'
import { useListSettings } from './use-list-settings'

interface ListFieldsTableFilterBadgesProps {
  listId: string
  fields: ListFieldsTableFilters_AiListFieldFragment[]
}
export const ListFieldsTableFilterBadges = ({ listId, fields }: ListFieldsTableFilterBadgesProps) => {
  const { filters, clearFieldFilters, removeFilter } = useListSettings(listId)
  return (
    <div className="flex flex-row flex-wrap gap-2 p-2">
      {fields
        .filter((field) => filters.some((filter) => filter.fieldId === field.id))
        .map((field) => (
          <div key={field.id} className="badge badge-outline badge-accent font-semibold">
            <span>{field.name}</span>:
            {filters
              .filter((filter) => filter.fieldId === field.id)
              .map((filter) => (
                <span key={filter.filterType} className="badge badge-xs badge-accent ml-1 text-nowrap">
                  {filter.filterType === 'equals' && `= "${filter.value}"`}
                  {filter.filterType === 'starts_with' && `starts with "${filter.value}"`}
                  {filter.filterType === 'ends_with' && `ends with "${filter.value}"`}
                  {filter.filterType === 'contains' && `contains "${filter.value}"`}
                  {filter.filterType === 'not_contains' && `not contains "${filter.value}"`}
                  {filter.filterType === 'is_empty' && `is empty`}
                  {filter.filterType === 'is_not_empty' && `is not empty`}
                  <button
                    type="button"
                    className="btn-xs btn-circle btn-ghost"
                    onClick={() => removeFilter(filter.fieldId, filter.filterType)}
                  >
                    ✕
                  </button>
                </span>
              ))}
            <button type="button" className="button" onClick={() => clearFieldFilters(field.id)}>
              x
            </button>
          </div>
        ))}
    </div>
  )
}
