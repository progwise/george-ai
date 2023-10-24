import { InfoCardTitle } from './info-card-title'
import { Summary } from './summary'
import { Keywords } from './keywords'
import { Link } from './link'
import { FragmentType, graphql, useFragment } from '@/src/gql'

const InfoCardFragment = graphql(`
  fragment InfoCard on summaries {
    id
    title
    url
    language
    publicationState
    keywords
    summary
    largeLanguageModel
  }
`)

interface InfoCardProps {
  summaryFragment: FragmentType<typeof InfoCardFragment>
  infoCardIndex: number
  webPageSummaryId: string
}
export const InfoCard = ({
  summaryFragment,
  infoCardIndex,
  webPageSummaryId,
}: InfoCardProps) => {
  const summary = useFragment(InfoCardFragment, summaryFragment)

  return (
    <div className="flex flex-col gap-5 border-2 p-8 rounded-md">
      <InfoCardTitle
        title={summary.title}
        publicationState={summary.publicationState}
        language={summary.language}
        infoCardIndex={infoCardIndex}
        webPageSummaryId={webPageSummaryId}
        largeLanguageModel={summary.largeLanguageModel}
      />
      <Summary key={summary.id} summary={summary.summary} />
      <Link url={summary.url} />
      <Keywords keywords={summary?.keywords} />
    </div>
  )
}
