import { getClient } from '@/app/client/urql-client'
import { FilterCheckbox } from './filter-checkbox'
import { graphql } from '@/src/gql'

export interface FilterSelectionProps {
  lang?: string[]
  status?: string[]
  llm?: string[]
}

const shouldDisplayFilter = (array: string[] | undefined) => {
  return (array?.length ?? 0) > 1
}

export const FilterSelection = async ({
  lang,
  status,
  llm,
}: FilterSelectionProps) => {
  const { data } = await getClient().query(
    graphql(`
      query GetFilters {
        filters {
          language
          largeLanguageModel
          publicationState
        }
      }
    `),
    {},
  )
  const filters = data?.filters

  return (
    <div className="flex items-center justify-end gap-3">
      {shouldDisplayFilter(filters?.publicationState) &&
        filters?.publicationState.map((state) => (
          <FilterCheckbox
            key={state}
            value={state}
            checked={status?.includes(state) ?? false}
            filter="status"
          />
        ))}

      {shouldDisplayFilter(filters?.publicationState) &&
        shouldDisplayFilter(filters?.language) && <div>|</div>}

      {shouldDisplayFilter(filters?.publicationState) &&
        !shouldDisplayFilter(filters?.language) &&
        shouldDisplayFilter(filters?.largeLanguageModel) && <div>|</div>}

      {shouldDisplayFilter(filters?.language) &&
        filters?.language.map((language) => (
          <FilterCheckbox
            key={language}
            value={language}
            checked={lang?.includes(language) ?? false}
            filter="lang"
          />
        ))}

      {shouldDisplayFilter(filters?.language) &&
        shouldDisplayFilter(filters?.largeLanguageModel) && <div>|</div>}

      {shouldDisplayFilter(filters?.largeLanguageModel) &&
        filters?.largeLanguageModel.map((model) => (
          <FilterCheckbox
            key={model}
            value={model}
            checked={llm?.includes(model) ?? false}
            filter="llm"
          />
        ))}
    </div>
  )
}
