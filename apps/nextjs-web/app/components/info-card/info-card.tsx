import { Title } from './title'
import { Summary } from './summary'
import { Keywords } from './keywords'
import { Link } from './link'
import { FragmentType, graphql, useFragment } from '@/src/gql'

const InfoCardFragment = graphql(`
  fragment InfoCard on ScrapedWebPage {
    title
    url
    locale
    publishedAt
    webPageSummaries {
      generatedKeywords
      generatedSummary
      feedback
    }
  }
`)

export const InfoCard = (props: {
  page: FragmentType<typeof InfoCardFragment>
}) => {
  const page = useFragment(InfoCardFragment, props.page)
  const summary = page.webPageSummaries?.at(0)

  return (
    <div className="flex flex-col gap-5 border-2 p-8 rounded-md">
      <Title
        title={page.title}
        publishedAt={page.publishedAt}
        locale={page.locale}
        feedback={summary?.feedback}
      />
      <Summary summary={summary?.generatedSummary ?? ''} />
      <Link url={page.url} />
      <Keywords keywords={JSON.parse(summary?.generatedKeywords ?? '[]')} />
    </div>
  )
}
