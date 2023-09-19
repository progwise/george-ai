import { InfoCard } from './components/info-card/info-card'
import { graphql } from '@/src/gql'
import { FilterSelectionProps } from './components/filter-selection/filter-selection'
import { getClient } from './client/urql-client'

interface PageListProps extends FilterSelectionProps {
  query?: string
  kw?: string[]
}

export async function PageList({
  query,
  lang,
  status,
  llm,
  kw,
}: PageListProps) {
  const result = await getClient().query(
    graphql(`
      query GetSearchWebPages(
        $query: String
        $language: [String!]
        $publicationState: [String!]
        $largeLanguageModel: [String!]
        $keywords: [String!]
      ) {
        searchResult(
          query: $query
          language: $language
          publicationState: $publicationState
          largeLanguageModel: $largeLanguageModel
          keywords: $keywords
        ) {
          id
          ...InfoCard
        }
      }
    `),
    {
      query,
      language: lang,
      publicationState: status,
      largeLanguageModel: llm,
      keywords: kw,
    },
  )
  const pages = result.data?.searchResult

  return (
    <>
      {pages?.map((page, index) => (
        <InfoCard
          key={page.id}
          pageFragment={page}
          query={query}
          position={index}
          webPageSummaryId={page.id}
          kw={kw}
        />
      ))}
    </>
  )
}
