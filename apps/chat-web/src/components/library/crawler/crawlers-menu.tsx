import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { graphql } from '../../../gql'
import { Crawlers_CrawlersMenuFragment, SelectedCrawler_CrawlersMenuFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { EditIcon } from '../../../icons/edit-icon'
import { PlusIcon } from '../../../icons/plus-icon'
import { CrawlerAddDialog } from './crawler-add-dialog'
import { CrawlerUpdateDialog } from './crawler-update-dialog'

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
  crawlers: Crawlers_CrawlersMenuFragment[]
}

export const CrawlersMenu = ({ libraryId, selectedCrawler, crawlers }: CrawlersMenuProps) => {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const addDialogRef = useRef<HTMLDialogElement>(null)
  const updateDialogRef = useRef<HTMLDialogElement>(null)
  const navigate = useNavigate({ from: '/libraries/$libraryId/crawlers/' })
  const { t } = useTranslation()

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
      <ul className="menu menu-xs md:menu-horizontal bg-base-200 rounded-box w-full flex-nowrap items-center shadow-lg">
        <li>
          <details ref={detailsRef}>
            <summary>{selectedCrawler ? selectedCrawler.uri : 'All Crawlers'}</summary>
            <ul className="z-40">
              <li>
                <Link to="." search={{ crawlerId: undefined }}>
                  All
                </Link>
              </li>
              {crawlers.map((crawler) => (
                <li key={crawler.id} className={crawler.id === selectedCrawler?.id ? 'active' : ''}>
                  <Link to="." search={{ crawlerId: crawler.id }}>
                    {crawler.uri}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </li>
        <li className="grow-1 items-end">
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

      <CrawlerUpdateDialog crawler={selectedCrawler!} updateDialogRef={updateDialogRef} />
    </>
  )
}
