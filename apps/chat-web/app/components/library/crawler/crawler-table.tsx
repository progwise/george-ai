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

  return (
    <div className="flex flex-col gap-4">
      <div className="self-start">
        <AddCrawlerButton libraryId={libraryId} />
      </div>
      {/* Mobile View */}
      <div className="block lg:hidden">
        {!aiLibrary?.crawlers?.length ? (
          <div className="mt-6 text-center">{t('texts.noCrawlersFound') || 'No crawlers found.'}</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {aiLibrary.crawlers.map((crawler, index) => (
              <div
                key={crawler.id}
                className={`shadow-xs border-base-300 flex flex-col gap-2 rounded-md border p-3 ${
                  index % 2 === 0 ? 'bg-base-100 dark:bg-base-100' : 'bg-base-200 dark:bg-base-200'
                }`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span
                    className="max-w-xs truncate break-all text-sm font-semibold sm:max-w-[60%]"
                    title={crawler.url}
                  >
                    {index + 1}. {crawler.url}
                  </span>
                  <div className="mt-1 flex flex-shrink-0 flex-row gap-1 sm:mt-0">
                    <RunCrawlerButton libraryId={libraryId} crawler={crawler} />
                    <UpdateCrawlerButton libraryId={libraryId} crawler={crawler} />
                    <DeleteCrawlerButton
                      crawlerId={crawler.id}
                      crawlerUrl={crawler.url}
                      filesCount={crawler.filesCount}
                      libraryId={libraryId}
                    />
                    <Link
                      to={`/libraries/$libraryId/updates`}
                      params={{ libraryId }}
                      search={{ crawlerId: crawler.id }}
                      className="btn btn-xs"
                    >
                      Last Updates
                    </Link>
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
                  <span>{t('crawlers.lastRun')}:</span>
                  <span>{dateTimeStringShort(crawler?.lastRun?.startedAt, language) || '-'}</span>
                  <span>{crawler.lastRun && !crawler.lastRun.success && <WarnIcon className="text-warning" />}</span>
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
              <th>{t('crawlers.maxDepth')}</th>
              <th>{t('crawlers.maxPages')}</th>
              <th>{t('crawlers.cronJob')}</th>
              <th>{t('crawlers.lastRun')}</th>
              <th></th>
              <th>{t('labels.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {aiLibrary?.crawlers.map((crawler, index) => (
              <tr key={crawler.id}>
                <td>{index + 1}</td>
                <td className="max-w-3xl truncate" title={crawler.url}>
                  {crawler.url}
                </td>
                <td>{crawler.maxDepth}</td>
                <td>{crawler.maxPages}</td>
                <td>
                  {crawler.cronJob?.cronExpression &&
                    cronstrue.toString(crawler.cronJob.cronExpression, { locale: language, verbose: true })}
                </td>
                <td>{dateTimeStringShort(crawler?.lastRun?.startedAt, language)}</td>
                <td>{crawler.lastRun && !crawler.lastRun.success && <WarnIcon className="text-warning" />}</td>

                <td className="flex gap-2">
                  <RunCrawlerButton libraryId={libraryId} crawler={crawler} />
                  <UpdateCrawlerButton libraryId={libraryId} crawler={crawler} />
                  <DeleteCrawlerButton
                    crawlerId={crawler.id}
                    crawlerUrl={crawler.url}
                    filesCount={crawler.filesCount}
                    libraryId={libraryId}
                  />

                  <Link
                    to={`/libraries/$libraryId/updates`}
                    params={{ libraryId }}
                    search={{ crawlerId: crawler.id }}
                    className="btn btn-xs"
                  >
                    Last Updates
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
