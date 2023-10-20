import { InfoCardTitle } from './info-card-title'
import { Summary } from './summary'
import { Keywords } from './keywords'
import { Link } from './link'
import { FragmentType, graphql, useFragment } from '@/src/gql'
import { SuggestModal } from './suggest-modal'

const InfoCardFragment = graphql(`
  fragment InfoCard on searchWebPages {
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
  pageFragment: FragmentType<typeof InfoCardFragment>
  position: number
  webPageSummaryId: string
}
export const InfoCard = ({
  pageFragment,
  position,
  webPageSummaryId,
}: InfoCardProps) => {
  const page = useFragment(InfoCardFragment, pageFragment)

  return (
    <div className="flex flex-col gap-5 border-2 p-8 rounded-md">
      <InfoCardTitle
        title={page.title}
        publicationState={page.publicationState}
        language={page.language}
        position={position}
        webPageSummaryId={webPageSummaryId}
        largeLanguageModel={page.largeLanguageModel}
      />
      <Summary key={page.id} summary={page.summary} />
      <Link url={page.url} />
      <Keywords keywords={page?.keywords} />
      <SuggestModal title={page.title} />
    </div>
  )
}
