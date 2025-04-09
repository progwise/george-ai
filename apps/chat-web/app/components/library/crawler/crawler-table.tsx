import { useSuspenseQuery } from '@tanstack/react-query'

import { dateTimeStringShort } from '@george-ai/web-utils'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { AddCrwalerButton } from './add-crawler-button'
import { getCrawlersQueryOptions } from './get-crawlers'

interface CrawlerTableProps {
  libraryId: string
}

export const CrawlerTable = ({ libraryId }: CrawlerTableProps) => {
  const { data } = useSuspenseQuery(getCrawlersQueryOptions(libraryId))
  const { language } = useTranslation()

  return (
    <>
      <AddCrwalerButton libraryId={libraryId} />

      <table className="table">
        <thead>
          <tr>
            <th>URL</th>
            <th>Max Depth</th>
            <th>Max Pages</th>
            <th>Last run</th>
          </tr>
        </thead>
        <tbody>
          {data.aiLibrary?.crawlers.map((crawler) => (
            <tr key={crawler.id}>
              <td>{crawler.url}</td>
              <td>{crawler.maxDepth}</td>
              <td>{crawler.maxPages}</td>
              <td>{dateTimeStringShort(crawler.lastRun, language)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
