import { useSuspenseQuery } from '@tanstack/react-query'

import { dateTimeStringShort } from '@george-ai/web-utils'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { AddCrawlerButton } from './add-crawler-button'
import { getCrawlersQueryOptions } from './get-crawlers'
import { RunCrawlerButton } from './run-crawler-button'

interface CrawlerTableProps {
  libraryId: string
}

export const CrawlerTable = ({ libraryId }: CrawlerTableProps) => {
  const { data } = useSuspenseQuery(getCrawlersQueryOptions(libraryId))
  const { t, language } = useTranslation()

  return (
    <>
      <AddCrawlerButton libraryId={libraryId} />

      <table className="table">
        <thead>
          <tr>
            <th>{t('crawlers.url')}</th>
            <th>{t('crawlers.maxDepth')}</th>
            <th>{t('crawlers.maxPages')}</th>
            <th>{t('crawlers.lastRun')}</th>
            <th>{t('labels.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {data.aiLibrary?.crawlers.map((crawler) => (
            <tr key={crawler.id}>
              <td>{crawler.url}</td>
              <td>{crawler.maxDepth}</td>
              <td>{crawler.maxPages}</td>
              <td>{dateTimeStringShort(crawler.lastRun, language)}</td>
              <td>
                <RunCrawlerButton crawlerId={crawler.id} libraryId={libraryId} isRunning={crawler.isRunning} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
