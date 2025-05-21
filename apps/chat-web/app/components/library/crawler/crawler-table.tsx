import { useSuspenseQuery } from '@tanstack/react-query'
import cronstrue from 'cronstrue'

import { dateTimeStringShort } from '@george-ai/web-utils'

import { graphql } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { AddCrawlerButton } from './add-crawler-button'
import { DeleteCrawlerButton } from './delete-crawler-button'
import { getCrawlersQueryOptions } from './get-crawlers'
import { RunCrawlerButton } from './run-crawler-button'
import { UpdateCrawlerButton } from './update-crawler-button'

// Import the German locale
import 'cronstrue/locales/de'

interface CrawlerTableProps {
  libraryId: string
}

graphql(`
  fragment CrawlerTable_LibraryCrawler on AiLibraryCrawler {
    id
    url
    maxDepth
    maxPages
    lastRun
    cronJob {
      cronExpression
    }
    filesCount
    ...RunCrawlerButton_Crawler
    ...UpdateCrawlerButton_Crawler
  }
`)

export const CrawlerTable = ({ libraryId }: CrawlerTableProps) => {
  const {
    data: { aiLibrary },
  } = useSuspenseQuery(getCrawlersQueryOptions(libraryId))

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
            <th>{t('crawlers.cronJob')}</th>
            <th>{t('crawlers.lastRun')}</th>
            <th>{t('labels.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {aiLibrary?.crawlers.map((crawler) => (
            <tr key={crawler.id}>
              <td>{crawler.url}</td>
              <td>{crawler.maxDepth}</td>
              <td>{crawler.maxPages}</td>
              <td>
                {crawler.cronJob?.cronExpression &&
                  cronstrue.toString(crawler.cronJob.cronExpression, { locale: language, verbose: true })}
              </td>
              <td>{dateTimeStringShort(crawler.lastRun, language)}</td>
              <td className="flex gap-2">
                <RunCrawlerButton libraryId={libraryId} crawler={crawler} />
                <UpdateCrawlerButton libraryId={libraryId} crawler={crawler} />
                <DeleteCrawlerButton
                  crawlerId={crawler.id}
                  crawlerUrl={crawler.url}
                  filesCount={crawler.filesCount}
                  libraryId={libraryId}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
