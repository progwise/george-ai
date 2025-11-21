import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { graphql } from '../../../gql'
import { Crawlers_CrawlersMenuFragment, SelectedCrawler_CrawlersMenuFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { EditIcon } from '../../../icons/edit-icon'
import { PlayIcon } from '../../../icons/play-icon'
import { PlusIcon } from '../../../icons/plus-icon'
import { StopIcon } from '../../../icons/stop-icon'
import { CrawlerAddDialog } from './crawler-add-dialog'
import { CrawlerUpdateDialog } from './crawler-update-dialog'
import { useCrawlerActions } from './use-crawler-actions'

graphql(`
  fragment SelectedCrawler_CrawlersMenu on AiLibraryCrawler {
    id
    uri
    uriType
    isRunning
    ...CrawlerForm_Crawler
  }
`)

graphql(`
  fragment Crawlers_CrawlersMenu on AiLibraryCrawler {
    id
    uri
    uriType
    isRunning
  }
`)

interface CrawlersMenuProps {
  libraryId: string
  selectedCrawler?: SelectedCrawler_CrawlersMenuFragment | null
  crawlers?: Crawlers_CrawlersMenuFragment[]
}

export const CrawlersMenu = ({ libraryId, selectedCrawler, crawlers }: CrawlersMenuProps) => {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const addDialogRef = useRef<HTMLDialogElement>(null)
  const updateDialogRef = useRef<HTMLDialogElement>(null)
  const navigate = useNavigate({ from: '/libraries/$libraryId/crawlers/' })
  const { t } = useTranslation()
  const { runCrawler, stopCrawler } = useCrawlerActions({ libraryId })

  useEffect(() => {
    if (detailsRef.current && selectedCrawler) {
      detailsRef.current.open = false
    }
  }, [selectedCrawler])

  useEffect(() => {
    if (detailsRef.current) {
      const onClickOutside = (event: MouseEvent) => {
        if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
          detailsRef.current.open = false
        }
      }
      document.addEventListener('click', onClickOutside)
      return () => {
        document.removeEventListener('click', onClickOutside)
      }
    }
  }, [detailsRef])

  return (
    <>
      <ul className="menu menu-sm md:menu-horizontal bg-base-200 rounded-box w-full flex-nowrap items-center shadow-lg">
        {crawlers ? (
          <li>
            <details ref={detailsRef} className="w-90">
              <summary className="text-sm font-semibold">
                <span className="overflow-auto overflow-ellipsis text-nowrap">
                  {selectedCrawler ? `${selectedCrawler.uriType}: ${selectedCrawler.uri}` : 'All Crawlers'}
                </span>
              </summary>
              <ul className="z-40">
                <li>
                  <Link to="." search={{ crawlerId: undefined }}>
                    All
                  </Link>
                </li>
                {crawlers.map((crawler) => (
                  <li key={crawler.id} className={crawler.id === selectedCrawler?.id ? 'active' : ''}>
                    <Link to="." search={{ crawlerId: crawler.id }} className="flex flex-col items-start gap-1">
                      <span className="text-base-content/70 italic">{crawler.uriType}:</span>
                      <span className="ml-2">{crawler.uri}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ) : (
          <li>
            <span className="overflow-auto overflow-ellipsis text-nowrap font-bold">
              {selectedCrawler ? `${selectedCrawler.uriType}: ${selectedCrawler.uri}` : 'no crawler selected'}
            </span>
          </li>
        )}
        <li>
          {selectedCrawler?.isRunning && (
            <span className="badge badge-primary gap-1">
              <span className="loading loading-spinner loading-xs"></span>
              {t('crawlers.runs')}
            </span>
          )}
        </li>
        <li className="grow items-end">
          <button
            type="button"
            className="btn btn-ghost"
            disabled={!selectedCrawler}
            onClick={() => {
              if (!selectedCrawler) return
              if (selectedCrawler.isRunning) {
                stopCrawler(selectedCrawler.id)
              } else {
                runCrawler(selectedCrawler.id)
              }
            }}
          >
            {selectedCrawler?.isRunning ? <StopIcon /> : <PlayIcon />}
            {selectedCrawler?.isRunning ? t('crawlers.stop') : t('crawlers.run')}
          </button>
        </li>
        <li>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => updateDialogRef.current?.showModal()}
            disabled={!selectedCrawler}
          >
            <EditIcon />
            {t('crawlers.updateCrawler')}
          </button>
        </li>
        <li className="">
          <button type="button" className="btn btn-ghost" onClick={() => addDialogRef.current?.showModal()}>
            <PlusIcon />
            {t('crawlers.addNew')}
          </button>
        </li>
      </ul>

      <CrawlerAddDialog
        libraryId={libraryId}
        ref={addDialogRef}
        onSuccess={(newCrawlerId) => navigate({ to: './$crawlerId', params: { crawlerId: newCrawlerId } })}
      />
      {selectedCrawler && <CrawlerUpdateDialog crawler={selectedCrawler!} updateDialogRef={updateDialogRef} />}
    </>
  )
}
