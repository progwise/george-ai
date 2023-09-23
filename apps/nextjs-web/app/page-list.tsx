'use client'

import { InfoCard } from './components/info-card/info-card'
import { graphql } from '@/src/gql'
import { FilterSelectionProps } from './components/filter-selection/filter-selection'
import {
  GetSearchWebPagesQuery,
  GetSearchWebPagesQueryVariables,
} from '@/src/gql/graphql'
import { useQuery } from '@urql/next'

interface PageListProps extends FilterSelectionProps {
  query?: string
  kw?: string[]
}

export function PageList({ query, lang, status, llm, kw }: PageListProps) {
  const [{ data }] = useQuery<
    GetSearchWebPagesQuery,
    GetSearchWebPagesQueryVariables
  >({
    query: graphql(`
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
    variables: {
      query,
      language: lang,
      publicationState: status,
      largeLanguageModel: llm,
      keywords: kw,
    },
  })

  return (
    <>
      {data?.searchResult?.map((page, index) => (
        <InfoCard
          key={page.id}
          pageFragment={page}
          position={index}
          webPageSummaryId={page.id}
        />
      ))}
    </>
  )
}
