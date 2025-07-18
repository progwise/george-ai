import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import cronstrue from 'cronstrue'

import { dateTimeString } from '@george-ai/web-utils'

import { graphql } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { AddCrawlerButton } from './add-crawler-button'
import { DeleteCrawlerButton } from './delete-crawler-button'
import { getCrawlersQueryOptions } from './get-crawlers'
import { RunCrawlerButton } from './run-crawler-button'

// Import the German locale
import 'cronstrue/locales/de'

import { Link } from '@tanstack/react-router'

import WarnIcon from '../../../icons/warn-icon'

interface CrawlerTableProps {
  libraryId: string
}

graphql(`
  fragment CrawlerTable_LibraryCrawler on AiLibraryCrawler {
    id
    url
    maxDepth
    maxPages
    lastRun {
      startedAt
      success
      errorMessage
    }
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
  const queryClient = useQueryClient()

  const invalidateRelatedQueries = async (crawlerRunId: string | undefined) => {
    if (!crawlerRunId) {
      return
    }
    await queryClient.invalidateQueries(getCrawlersQueryOptions(libraryId))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="self-start">
        <AddCrawlerButton libraryId={libraryId} />
      </div>
      {/* Mobile View */}
      <div className="block lg:hidden">
        {!aiLibrary?.crawlers || aiLibrary.crawlers.length < 1 ? (
          <div className="mt-6 text-center">{t('texts.noCrawlersFound')}</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {aiLibrary.crawlers.map((crawler, index) => (
              <div
                key={crawler.id}
                className={`shadow-xs border-base-300 flex flex-col gap-2 rounded-md border p-3 ${
                  index % 2 === 0 ? 'bg-base-100 dark:bg-base-100' : 'bg-base-200 dark:bg-base-200'
                }`}
              >
                <div className="sm:items-center sm:justify-between">
                  <div className="mb-2 w-full break-all text-sm font-semibold" title={crawler.url}>
                    <a href={crawler.url} target="_blank" rel="noopener noreferrer" className="link">
                      {index + 1}. {crawler.url}
                    </a>
                  </div>
                  <div className="flex justify-center gap-2">
                    <RunCrawlerButton
                      className="btn btn-xs"
                      crawler={crawler}
                      afterStart={invalidateRelatedQueries}
                      afterStop={invalidateRelatedQueries}
                    />
                    <DeleteCrawlerButton
                      crawlerId={crawler.id}
                      crawlerUrl={crawler.url}
                      filesCount={crawler.filesCount}
                      libraryId={libraryId}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1 text-sm">
                  <span>{t('crawlers.maxDepth')}:</span>
                  <span>{crawler.maxDepth}</span>
                  <span>{t('crawlers.maxPages')}:</span>
                  <span>{crawler.maxPages}</span>
                  <span>{t('crawlers.cronJob')}:</span>
                  <span>
                    {crawler.cronJob?.cronExpression
                      ? cronstrue.toString(crawler.cronJob.cronExpression, { locale: language, verbose: true })
                      : '-'}
                  </span>
                  <span className="flex content-center">
                    <span>{t('crawlers.lastRun')}:</span>
                    {crawler.lastRun && !crawler.lastRun.success && (
                      <WarnIcon className="text-warning" tooltip={crawler.lastRun.errorMessage} />
                    )}
                  </span>
                  <span>{dateTimeString(crawler?.lastRun?.startedAt, language) || '-'} </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block">
        <table className="table">
          <thead className="bg-base-200">
            <tr>
              <th>#</th>
              <th>{t('crawlers.url')}</th>
              <th>
                {t('crawlers.maxDepth')}/{t('crawlers.maxPages')}
              </th>
              <th>{t('crawlers.cronJob')}</th>
              <th>{t('crawlers.lastRun')}</th>
              <th>{t('labels.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {aiLibrary?.crawlers.map((crawler, index) => (
              <tr key={crawler.id}>
                <td className="align-top">{index + 1}</td>
                <td className="max-w-3xl truncate align-top" title={crawler.url}>
                  <a href={crawler.url} target="_blank" rel="noopener noreferrer" className="link">
                    {crawler.url}
                  </a>
                </td>
                <td className="align-top">
                  {crawler.maxDepth}/{crawler.maxPages}
                </td>
                <td className="align-top">
                  {crawler.cronJob?.cronExpression &&
                    cronstrue.toString(crawler.cronJob.cronExpression, { locale: language, verbose: true })}
                </td>
                <td className="align-top">
                  {dateTimeString(crawler?.lastRun?.startedAt, language)}{' '}
                  {crawler.lastRun && !crawler.lastRun.success && (
                    <WarnIcon className="text-warning inline-block size-3" tooltip={crawler.lastRun.errorMessage} />
                  )}
                </td>

                <td className="flex gap-2 align-top">
                  <RunCrawlerButton
                    className="btn btn-xs"
                    crawler={crawler}
                    afterStart={invalidateRelatedQueries}
                    afterStop={invalidateRelatedQueries}
                  />
                  <Link
                    to="/libraries/$libraryId/crawlers/$crawlerId"
                    params={{ libraryId, crawlerId: crawler.id }}
                    className="btn btn-xs"
                  >
                    {t('crawlers.details')}
                  </Link>
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
      </div>
    </div>
  )
}
