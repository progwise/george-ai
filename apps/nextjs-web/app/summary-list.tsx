import { InfoCard } from './components/info-card/info-card'
import { graphql } from '@/src/gql'
import { FilterSelectionProps } from './components/filter-selection/filter-selection'
import { getClient } from './client/urql-client'

interface SummaryListProps extends FilterSelectionProps {
  query?: string
  kw?: string[]
}

export async function SummaryList({
  query,
  lang,
  status,
  llm,
  kw,
}: SummaryListProps) {
  const { data } = await getClient().query(
    graphql(`
      query CombinedQuery(
        $query: String
        $language: [String!]
        $publicationState: [String!]
        $largeLanguageModel: [String!]
        $keywords: [String!]
      ) {
        locales {
          locales
        }
        summaries(
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

  const summaries = data?.summaries
  const locales = data?.locales.locales ?? []

  if (!Array.isArray(summaries)) {
    return <span>An error has occurred</span>
  }

  if (summaries?.length === 0) {
    return <span>No entries found</span>
  }

  return (
    <>
      {summaries?.map((summary, index) => (
        <InfoCard
          key={summary.id}
          summaryFragment={summary}
          infoCardIndex={index}
          locales={locales}
        />
      ))}
    </>
  )
}
