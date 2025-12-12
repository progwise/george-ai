import { ListFieldsTableFilters_AiListFieldFragment } from '../../gql/graphql'
import { useListSettings } from './use-list-settings'

interface ListFieldsTableFilterBadgesProps {
  listId: string
  fields: ListFieldsTableFilters_AiListFieldFragment[]
  selectedItem?: { id: string; name?: string } | null
}
export const ListFieldsTableFilterBadges = ({ listId, fields, selectedItem }: ListFieldsTableFilterBadgesProps) => {
  const { filters, clearFieldFilters, removeFilter, removeSelectedItem } = useListSettings(listId)
  return (
    <div className="flex flex-row flex-wrap gap-2 p-2">
      {selectedItem && (
        <div key={selectedItem.id} className="badge badge-outline font-semibold badge-accent">
          <span>Selected Item:</span>
          <span className="ml-1 badge badge-xs text-nowrap badge-accent">
            {selectedItem.name ? `"${selectedItem.name}"` : selectedItem.id}
            <button type="button" className="btn-circle btn-ghost btn-xs" onClick={() => removeSelectedItem()}>
              ✕
            </button>
          </span>
        </div>
      )}
      {fields
        .filter((field) => filters.some((filter) => filter.fieldId === field.id))
        .map((field) => (
          <div key={field.id} className="badge badge-outline font-semibold badge-accent">
            <span>{field.name}</span>:
            {filters
              .filter((filter) => filter.fieldId === field.id)
              .map((filter) => (
                <span key={filter.filterType} className="ml-1 badge badge-xs text-nowrap badge-accent">
                  {filter.filterType === 'equals' && `= "${filter.value}"`}
                  {filter.filterType === 'starts_with' && `starts with "${filter.value}"`}
                  {filter.filterType === 'ends_with' && `ends with "${filter.value}"`}
                  {filter.filterType === 'contains' && `contains "${filter.value}"`}
                  {filter.filterType === 'not_contains' && `not contains "${filter.value}"`}
                  {filter.filterType === 'is_empty' && `is empty`}
                  {filter.filterType === 'is_not_empty' && `is not empty`}
                  <button
                    type="button"
                    className="btn-circle btn-ghost btn-xs"
                    onClick={() => removeFilter(filter.fieldId, filter.filterType)}
                  >
                    ✕
                  </button>
                </span>
              ))}
            <button type="button" className="btn-circle btn-ghost btn-xs" onClick={() => clearFieldFilters(field.id)}>
              x
            </button>
          </div>
        ))}
    </div>
  )
}
