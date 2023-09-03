import { PublicationState } from '@/src/gql/graphql'
import { FilterCheckbox } from './filter-checkbox'
import { graphql } from '@/src/gql'
import { getClient } from '@/app/page-list'

export interface FilterSelectionProps {
  lang?: string
  status?: string
  llm?: string
}

const capitalizeFirstLetter = (string_: string) => {
  return string_.charAt(0).toUpperCase() + string_.slice(1)
}

export const FilterSelection = async ({
  lang,
  status,
  llm,
}: FilterSelectionProps) => {
  const result = await getClient().query(
    graphql(`
      query GetAllSummaries {
        searchResult {
          language
          largeLanguageModel
        }
      }
    `),
    {},
  )
  const allSummaries = result.data?.searchResult
  const languageSet = new Set<string>()
  const largeLanguageModelSet = new Set<string>()

  for (const summary of allSummaries || []) {
    languageSet.add(summary.language)
    largeLanguageModelSet.add(summary.largeLanguageModel)
  }
  const languages = [...languageSet]
  const largeLanguageModels = [...largeLanguageModelSet]

  return (
    <div className="flex justify-end gap-3">
      {Object.values(PublicationState).map((state) => (
        <FilterCheckbox
          key={state}
          value={state.toLowerCase()}
          checked={status === state.toLowerCase()}
          filter="status"
        />
      ))}
      {languages.map((language) => (
        <FilterCheckbox
          key={language}
          value={language}
          checked={lang === language}
          filter="lang"
        />
      ))}
      {largeLanguageModels.map((model) => (
        <FilterCheckbox
          key={model}
          value={capitalizeFirstLetter(model)}
          checked={llm === capitalizeFirstLetter(model)}
          filter="llm"
        />
      ))}
    </div>
  )
}
