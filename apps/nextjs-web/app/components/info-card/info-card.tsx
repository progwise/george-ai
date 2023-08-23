import { InfoCardTitle } from './info-card-title'
import { Summary } from './summary'
import { Keywords } from './keywords'
import { Link } from './link'
import { FragmentType, graphql, useFragment } from '@/src/gql'

const InfoCardFragment = graphql(`
  fragment InfoCard on IndexedWebPage {
    title
    url
    language
    publicationState
    keywords
    summary
  }
`)

export const InfoCard = (props: {
  pageFragment: FragmentType<typeof InfoCardFragment>
}) => {
  const page = useFragment(InfoCardFragment, props.pageFragment)

  return (
    <div className="flex flex-col gap-5 border-2 p-8 rounded-md">
      <InfoCardTitle
        title={page.title}
        publicationState={page.publicationState}
        language={page.language}
      />
      <Summary summary={page.summary} />
      <Link url={page.url} />
      <Keywords keywords={JSON.parse(page?.keywords)} />
    </div>
  )
}
