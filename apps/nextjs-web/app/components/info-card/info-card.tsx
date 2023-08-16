import { Title } from './title'
import { Summary } from './summary'
import { Keywords } from './keywords'
import { Link } from './link'
import {
  ScrapedWebPageFragmentFragment,
  WebPageSummaryFragmentFragment,
} from '@/src/gql/graphql'

export const InfoCard = ({
  page,
}: {
  page: ScrapedWebPageFragmentFragment
}) => {
  const summary = page.webPageSummaries?.at(0) as WebPageSummaryFragmentFragment

  return (
    <div className="flex flex-col gap-5 border-2 p-8 rounded-md">
      <Title
        title={page.title}
        publishedAt={page.publishedAt}
        feedback={summary?.feedback}
      />
      <Summary summary={summary?.generatedSummary ?? ''} />
      <Link url={page.url} />
      <Keywords keywords={JSON.parse(summary?.generatedKeywords ?? '[]')} />
    </div>
  )
}
