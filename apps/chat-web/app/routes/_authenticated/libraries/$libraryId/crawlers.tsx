import { createFileRoute } from '@tanstack/react-router'

import { CrawlerTable } from '../../../../components/library/crawler/crawler-table'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/crawlers')({
  component: RouteComponent,
})

function RouteComponent() {
  const { libraryId } = Route.useParams()
  return <CrawlerTable libraryId={libraryId} />
}
