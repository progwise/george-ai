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
  const { data } = await getClient().query(
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
  const pages = data?.searchResult

  if (pages?.length === 0) {
    return <span>No entries found</span>
  }

  return (
    <>
      {pages?.map((page, index) => (
        <InfoCard
          key={page.id}
          pageFragment={page}
          infoCardIndex={index}
          webPageSummaryId={page.id}
        />
      ))}
    </>
  )
}
