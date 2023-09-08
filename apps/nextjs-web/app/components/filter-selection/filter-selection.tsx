import { PublicationState } from '@/src/gql/graphql'
import { FilterCheckbox } from './filter-checkbox'
import { graphql } from '@/src/gql'
import { getClient } from '@/app/page-list'

export interface FilterSelectionProps {
  lang?: string[]
  status?: string[]
  llm?: string[]
}

export const FilterSelection = async ({
  lang,
  status,
  llm,
}: FilterSelectionProps) => {
  const result = await getClient().query(
    graphql(`
      query GetLangAndLlm {
        additionalSearchFilters {
          language
          largeLanguageModel
        }
      }
    `),
    {},
  )
  const allLangAndLlm = result.data?.additionalSearchFilters

  return (
    <div className="flex justify-end gap-3">
      {Object.values(PublicationState).map((state) => (
        <FilterCheckbox
          key={state}
          value={state}
          checked={status?.includes(state) ?? false}
          filter="status"
        />
      ))}
      {allLangAndLlm?.language.map((language) => (
        <FilterCheckbox
          key={language}
          value={language}
          checked={lang?.includes(language) ?? false}
          filter="lang"
        />
      ))}
      {allLangAndLlm?.largeLanguageModel.map((model) => (
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
