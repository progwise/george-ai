import { Link } from '@tanstack/react-router'
import React from 'react'
import { twMerge } from 'tailwind-merge'

import { duration } from '@george-ai/web-utils'

import { graphql } from '../../../gql'
import { CrawlerRuns_CrawlerRunsTableFragment } from '../../../gql/graphql'
import { FilterIcon } from '../../../icons/filter-icon'
import { LinkIcon } from '../../../icons/link-icon'
import { ClientDate } from '../../client-date'

graphql(`
  fragment CrawlerRuns_CrawlerRunsTable on AiLibraryCrawlerRun {
    id
    crawlerId
    crawler {
      id
      libraryId
      uri
      uriType
    }
    updateStats {
      updateType
      count
    }
    startedAt
    endedAt
    success
    stoppedByUser
    errorMessage
    runByUserId
    runBy {
      id
      name
      email
    }
  }
`)

export const CrawlerRunsTable = ({ crawlerRuns }: { crawlerRuns: CrawlerRuns_CrawlerRunsTableFragment[] }) => {
  return (
    <div className="hidden h-full w-full overflow-auto lg:block">
      <table className="table-sm table-pin-rows table-pin-cols table">
        <thead>
          <tr>
            <th className="border-b px-4 py-2 text-left">Crawler</th>
            <th className="border-b px-4 py-2 text-left">Duration</th>
            <th className="border-b px-4 py-2 text-left">Ended At</th>
            <th className="border-b px-4 py-2 text-left">Success</th>
            <th className="border-b px-4 py-2 text-left">Stopped By User</th>
            <th className="border-b px-4 py-2 text-left">Error Message</th>
            <th className="border-b px-4 py-2 text-left">Run By</th>
          </tr>
        </thead>
        <tbody>
          {crawlerRuns.map((run) => (
            <React.Fragment key={run.id}>
              <tr
                key={run.id}
                className={twMerge('hover:bg-base-300', !run.endedAt && 'italic', !run.success && 'bg-error/10')}
              >
                <th
                  className={twMerge(
                    'hover:bg-base-300 border-t px-4 py-2 align-top',
                    !run.endedAt && 'italic',
                    !run.success && 'bg-error/0',
                  )}
                >
                  <div>
                    <div className="flex items-center gap-1">
                      <Link to="." search={{ crawlerId: run.crawlerId }} className="flex items-center gap-1">
                        <span>{run.crawler.uriType}</span>
                        <FilterIcon className="size-3" />
                      </Link>
                      {!run.endedAt ? (
                        <div className="badge badge-xs badge-neutral text-nowrap">Running</div>
                      ) : !run.success ? (
                        <div className="badge badge-xs badge-error text-nowrap">Failed</div>
                      ) : (
                        <div className="badge badge-xs badge-success text-nowrap">Success</div>
                      )}
                      {run.stoppedByUser && (
                        <div className="badge badge-xs badge-warning text-nowrap">Stopped By User</div>
                      )}
                    </div>
                    <div>
                      <Link
                        to="/libraries/$libraryId/crawlers/$crawlerId/runs/$crawlerRunId"
                        params={{ libraryId: run.crawler.libraryId, crawlerId: run.crawlerId, crawlerRunId: run.id }}
                        className="text-base-content/90text-xs flex items-center gap-1 font-light italic"
                      >
                        <ClientDate date={run.startedAt} fallback="" />
                        <LinkIcon className="size-3" />
                      </Link>
                    </div>
                  </div>
                </th>
                <td className="text-nowrap border-t px-4 py-2 align-top font-bold">
                  {duration(run.startedAt, run.endedAt ? run.endedAt : new Date())}
                </td>
                <td className="border-t px-4 py-2 align-top">
                  <ClientDate date={run.endedAt} fallback="N/A" />
                </td>
                <td className="border-t px-4 py-2 align-top">{run.success ? 'Yes' : 'No'}</td>
                <td className="border-t px-4 py-2 align-top">{run.stoppedByUser ? 'Yes' : 'No'}</td>
                <td className="border-t px-4 py-2 align-top">
                  <div className="max-h-12 overflow-auto">{run.errorMessage || 'N/A'}</div>
                </td>
                <td className="border-t px-4 py-2 align-top">{run.runBy?.email || 'N/A'}</td>
              </tr>
              <tr className="hover:bg-base-300">
                <th className="hover:bg-base-300 align-top">
                  <Link
                    to="/libraries/$libraryId/crawlers/$crawlerId/runs/$crawlerRunId"
                    params={{ libraryId: run.crawler.libraryId, crawlerId: run.crawlerId, crawlerRunId: run.id }}
                    className="text-base-content/50 text-xs font-light italic"
                  >
                    {run.id}
                  </Link>
                </th>
                <td colSpan={6} className="px-4 py-2">
                  <div className="flex flex-row gap-1">
                    <div className="badge badge-xs badge-neutral text-nowrap">{run.crawler.uri}</div>
                    {run.updateStats.map((stat) => (
                      <div
                        key={stat.updateType}
                        className={twMerge(
                          'badge badge-xs text-nowrap',
                          stat.updateType === 'added'
                            ? 'badge-success'
                            : stat.updateType === 'error'
                              ? 'badge-error'
                              : stat.updateType === 'skipped'
                                ? 'badge-warning'
                                : 'badge-info',
                        )}
                      >
                        {stat.updateType}: {stat.count}
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
