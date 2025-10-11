import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import cronstrue from 'cronstrue'
import { useRef, useState } from 'react'

import { dateTimeString } from '@george-ai/web-utils'

import { graphql } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { EyeIcon } from '../../../icons/eye-icon'
import { PlayIcon } from '../../../icons/play-icon'
import { TrashIcon } from '../../../icons/trash-icon'
import WarnIcon from '../../../icons/warn-icon'
import { DialogForm } from '../../dialog-form'
import { CrawlerActionsBar } from './crawler-actions-bar'
import { getCrawlersQueryOptions } from './get-crawlers'
import { useCrawlerActions } from './use-crawler-actions'

// Import the German locale
import 'cronstrue/locales/de'

interface CrawlerTableProps {
  libraryId: string
}

graphql(`
  fragment CrawlerTable_LibraryCrawler on AiLibraryCrawler {
    id
    uri
    uriType
    maxDepth
    maxPages
    isRunning
    lastRun {
      startedAt
      success
      errorMessage
    }
    cronJob {
      cronExpression
    }
    filesCount
  }
`)

export const CrawlerTable = ({ libraryId }: CrawlerTableProps) => {
  const {
    data: { aiLibrary },
  } = useSuspenseQuery(getCrawlersQueryOptions(libraryId))

  const { t, language } = useTranslation()
  const { handleRunStop, isPending, deleteCrawler } = useCrawlerActions({ libraryId })
  const deleteDialogRef = useRef<HTMLDialogElement>(null)
  const [crawlerToDelete, setCrawlerToDelete] = useState<{
    id: string
    url: string
    filesCount: number
  } | null>(null)

  const handleDeleteClick = (crawlerId: string, crawlerUrl: string, filesCount: number) => {
    setCrawlerToDelete({ id: crawlerId, url: crawlerUrl, filesCount })
    deleteDialogRef.current?.showModal()
  }

  const handleDeleteSubmit = () => {
    if (crawlerToDelete) {
      deleteCrawler(
        { data: crawlerToDelete.id },
        {
          onSuccess: () => {
            deleteDialogRef.current?.close()
            setCrawlerToDelete(null)
          },
        },
      )
    }
  }

  return (
    <div className="bg-base-100 grid h-full w-full grid-rows-[auto_1fr]">
      <div>
        <div className="relative flex justify-between align-top">
          <div className="flex-start flex flex-col gap-1 overflow-y-auto">
            <h3 className="text-base-content text-nowrap text-xl font-bold">{t('crawlers.title')}</h3>
          </div>
          <div className="right-0 z-40 md:flex">
            <CrawlerActionsBar libraryId={libraryId} />
          </div>
        </div>
      </div>
      <div className="min-h-0 min-w-0">
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
                    <div className="mb-2 w-full break-all text-sm font-semibold" title={crawler.uri}>
                      <a href={crawler.uri} target="_blank" rel="noopener noreferrer" className="link">
                        {index + 1}. {crawler.uri}
                      </a>
                    </div>
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRunStop(crawler.id, crawler.isRunning)}
                        disabled={isPending}
                        className="btn btn-xs"
                      >
                        {crawler.isRunning ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <PlayIcon />
                        )}
                        {crawler.isRunning ? t('crawlers.stop') : t('crawlers.run')}
                      </button>
                      <Link
                        to="/libraries/$libraryId/crawlers/$crawlerId"
                        params={{ libraryId, crawlerId: crawler.id }}
                        className="btn btn-xs"
                      >
                        {t('crawlers.details')}
                      </Link>
                      <button
                        type="button"
                        className="btn btn-xs"
                        onClick={() => handleDeleteClick(crawler.id, crawler.uri, crawler.filesCount)}
                      >
                        <TrashIcon />
                        {t('actions.delete')}
                      </button>
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
        <div className="hidden h-full w-full overflow-auto lg:block">
          <table className="table-zebra table-sm table-pin-rows table-pin-cols table">
            <thead>
              <tr>
                <th>#</th>
                <td>{t('crawlers.uri')}</td>
                <td>
                  {t('crawlers.maxDepth')}/{t('crawlers.maxPages')}
                </td>
                <td>{t('crawlers.cronJob')}</td>
                <td>{t('crawlers.lastRun')}</td>
              </tr>
            </thead>
            <tbody>
              {aiLibrary?.crawlers.map((crawler, index) => (
                <tr key={crawler.id} className="hover:bg-base-300">
                  <th>
                    <div className="flex items-center justify-between">
                      <span className="text-nowrap">{index + 1}</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleRunStop(crawler.id, crawler.isRunning)}
                          disabled={isPending}
                          className="tooltip btn btn-square btn-xs tooltip-right"
                          data-tip={crawler.isRunning ? t('crawlers.stop') : t('crawlers.run')}
                        >
                          {crawler.isRunning ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <PlayIcon className="h-4 w-4" />
                          )}
                        </button>
                        <Link
                          to="/libraries/$libraryId/crawlers/$crawlerId"
                          params={{ libraryId, crawlerId: crawler.id }}
                          className="tooltip btn btn-square btn-xs tooltip-right"
                          data-tip={t('crawlers.details')}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          className="tooltip btn btn-square btn-xs tooltip-right"
                          data-tip={t('actions.drop')}
                          onClick={() => handleDeleteClick(crawler.id, crawler.uri, crawler.filesCount)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </th>
                  <td className="max-w-3xl truncate" title={crawler.uri}>
                    <a href={crawler.uri} target="_blank" rel="noopener noreferrer" className="link">
                      {crawler.uri}
                    </a>
                  </td>
                  <td>
                    {crawler.maxDepth}/{crawler.maxPages}
                  </td>
                  <td>
                    {crawler.cronJob?.cronExpression &&
                      cronstrue.toString(crawler.cronJob.cronExpression, { locale: language, verbose: true })}
                  </td>
                  <td>
                    {dateTimeString(crawler?.lastRun?.startedAt, language)}{' '}
                    {crawler.lastRun && !crawler.lastRun.success && (
                      <WarnIcon className="text-warning inline-block size-3" tooltip={crawler.lastRun.errorMessage} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DialogForm
        ref={deleteDialogRef}
        title={t('crawlers.delete')}
        description={
          crawlerToDelete
            ? t('crawlers.deleteConfirmation', {
                crawlerUrl: crawlerToDelete.url,
                filesCount: crawlerToDelete.filesCount,
              })
            : ''
        }
        onSubmit={handleDeleteSubmit}
        disabledSubmit={isPending}
        submitButtonText={t('actions.delete')}
      />
    </div>
  )
}
