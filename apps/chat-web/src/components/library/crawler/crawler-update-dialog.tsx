import { graphql } from '../../../gql'
import { SelectedCrawler_CrawlerUpdateDialogFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { DialogForm } from '../../dialog-form'
import { CrawlerForm } from './crawler-form'
import { useCrawlerActions } from './use-crawler-actions'

graphql(`
  fragment SelectedCrawler_CrawlerUpdateDialog on AiLibraryCrawler {
    id
    uri
    uriType
    maxDepth
    maxPages
    isRunning
    ...CrawlerForm_Crawler
    libraryId
  }
`)

interface CrawlerUpdateDialogProps {
  crawler: SelectedCrawler_CrawlerUpdateDialogFragment
  updateDialogRef: React.RefObject<HTMLDialogElement | null>
}

export const CrawlerUpdateDialog = ({ crawler, updateDialogRef }: CrawlerUpdateDialogProps) => {
  const { t } = useTranslation()
  const { updateCrawler, isPending } = useCrawlerActions({ libraryId: crawler.libraryId })

  const handleUpdateSubmit = async (formData: FormData) => {
    updateCrawler({ data: formData })
  }
  return (
    <DialogForm
      ref={updateDialogRef}
      title={t('crawlers.updateCrawler')}
      onSubmit={handleUpdateSubmit}
      disabledSubmit={isPending}
      submitButtonText={t('crawlers.updateCrawler')}
      className="modal-box max-h-[90vh] max-w-4xl"
    >
      <CrawlerForm libraryId={crawler.libraryId} crawler={crawler!} />
    </DialogForm>
  )
}
