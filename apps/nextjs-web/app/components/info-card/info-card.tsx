import { InfoCardTitle } from './info-card-title'
import { Summary } from './summary'
import { Keywords } from './keywords'
import { Link } from './link'
import { FragmentType, graphql, useFragment } from '@/src/gql'
import { SuggestModal } from './suggestModal/suggest-modal'

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
  locales: string[]
}
export const InfoCard = ({
  summaryFragment,
  infoCardIndex,
  locales,
}: InfoCardProps) => {
  const summary = useFragment(InfoCardFragment, summaryFragment)

  return (
    <div
      id={`infoCard_${summary.id}`}
      className={`card card-body card-bordered border-current flex flex-col gap-5 p-8 shadow-xl`}
    >
      <InfoCardTitle
        title={summary.title}
        publicationState={summary.publicationState}
        language={summary.language}
        infoCardIndex={infoCardIndex}
        summaryId={summary.id}
        largeLanguageModel={summary.largeLanguageModel}
      />
      <Summary
        key={`summary_${summary.id}`}
        index={summary.id}
        summary={summary.summary}
      />
      <SuggestModal
        key={`modal_${summary.id}`}
        title={summary.title}
        summaryId={summary.id}
        locales={locales}
      />
      <Link url={summary.url} />
      <Keywords keywords={summary?.keywords} />
    </div>
  )
}
