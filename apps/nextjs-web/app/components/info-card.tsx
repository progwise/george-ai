import { Page } from '../page'
import { Title } from './info-card/title'
import { Summary } from './info-card/summary'
import { Keywords } from './info-card/keywords'
import { Link } from './info-card/link'

export const InfoCard = ({ page }: { page: Page }) => {
  const summary = page.webPageSummaries.at(0)

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
