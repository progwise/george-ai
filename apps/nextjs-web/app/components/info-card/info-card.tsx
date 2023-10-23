import { InfoCardTitle } from './info-card-title'
import { Summary } from './summary'
import { Keywords } from './keywords'
import { Link } from './link'
import { FragmentType, graphql, useFragment } from '@/src/gql'
import { SuggestModal } from './suggestModal/suggest-modal'

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
}
export const InfoCard = ({ pageFragment, position }: InfoCardProps) => {
  const page = useFragment(InfoCardFragment, pageFragment)

  return (
    <div
      id={`infoCard_${page.id}`}
      className={`card card-body card-bordered border-current flex flex-col gap-5 p-8 shadow-xl`}
    >
      <InfoCardTitle
        title={page.title}
        publicationState={page.publicationState}
        language={page.language}
        position={position}
        summaryId={page.id}
        largeLanguageModel={page.largeLanguageModel}
      />
      <Summary
        key={`summary_${page.id}`}
        index={page.id}
        summary={page.summary}
      />
      <SuggestModal
        key={`modal_${page.id}`}
        title={page.title}
        summaryId={page.id}
      />
      <Link url={page.url} />
      <Keywords keywords={page?.keywords} />
    </div>
  )
}
