import { InfoCard } from './components/info-card/info-card'
import { graphql } from '@/src/gql'
import { FilterSelectionProps } from './components/filter-selection/filter-selection'
import { getClient } from './client/strapi-client'

interface PageListProps extends FilterSelectionProps {
  query?: string
}

export async function PageList({ query, lang, status, llm }: PageListProps) {
  const result = await getClient().query(
    graphql(`
      query GetIndexedWebPage(
        $query: String
        $language: [String!]
        $publicationState: [String!]
        $largeLanguageModel: [String!]
      ) {
        searchResult(
          query: $query
          language: $language
          publicationState: $publicationState
          largeLanguageModel: $largeLanguageModel
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
        />
      ))}
    </>
  )
}
