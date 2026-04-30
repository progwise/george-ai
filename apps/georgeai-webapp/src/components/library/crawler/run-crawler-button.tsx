import { twMerge } from 'tailwind-merge'

import { graphql } from '../../../gql'
import { RunCrawlerButton_CrawlerFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { PlayIcon } from '../../../icons/play-icon'
import { useCrawlerActions } from './use-crawler-actions'

graphql(`
  fragment RunCrawlerButton_Crawler on AiLibraryCrawler {
    id
    libraryId
    isRunning
  }
`)

interface RunCrawlerButtonProps {
  crawler: RunCrawlerButton_CrawlerFragment
  className?: string
  afterStart?: (crawlerRunId: string) => void
}

export const RunCrawlerButton = ({ crawler, className, afterStart }: RunCrawlerButtonProps) => {
  const { runCrawler, stopCrawler, isPending } = useCrawlerActions(crawler.libraryId)

  const { t } = useTranslation()

  const handleClick = () => {
    if (!crawler.isRunning) {
      runCrawler(crawler.id, {
        onSuccess: (crawlerRunId: string) => {
          if (afterStart) {
            afterStart(crawlerRunId)
          }
        },
      })
    } else {
      stopCrawler(crawler.id)
    }
  }

  return (
    <button type="button" disabled={isPending} onClick={handleClick} className={twMerge('btn btn-primary', className)}>
      {crawler.isRunning ? <span className="loading loading-xs loading-spinner"></span> : <PlayIcon />}
      {crawler.isRunning ? t('crawlers.stop') : t('crawlers.run')}
    </button>
  )
}
