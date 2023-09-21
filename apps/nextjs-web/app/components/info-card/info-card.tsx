import { InfoCardTitle } from './info-card-title'
import { Summary } from './summary'
import { Keywords } from './keywords'
import { Link } from './link'
import { FragmentType, graphql, useFragment } from '@/src/gql'

const InfoCardFragment = graphql(`
  fragment InfoCard on searchWebPages {
    title
    url
    language
    publicationState
    keywords
    summary
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
      />
      <Summary summary={page.summary} position={position} />
      <Link url={page.url} />
      <Keywords keywords={page?.keywords} />
    </div>
  )
}
