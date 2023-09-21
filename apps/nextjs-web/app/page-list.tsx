'use client'

import { InfoCard } from './components/info-card/info-card'
import { graphql } from '@/src/gql'
import { FilterSelectionProps } from './components/filter-selection/filter-selection'
import { getClient } from './client/urql-client'
import { useEffect, useState } from 'react'
import { GetSearchWebPagesQuery } from '@/src/gql/graphql'

interface PageListProps extends FilterSelectionProps {
  query?: string
}

export function PageList({ query, lang, status, llm }: PageListProps) {
  const [pages, setPages] = useState<
    GetSearchWebPagesQuery['searchResult'] | null
  >()

  useEffect(() => {
    const executeQuery = async () => {
      try {
        const result = await getClient().query(
          graphql(`
            query GetSearchWebPages(
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
        setPages(result.data?.searchResult)
      } catch (error) {
        console.error(error)
      }
    }

    executeQuery()
  }, [query, lang, status, llm])

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
