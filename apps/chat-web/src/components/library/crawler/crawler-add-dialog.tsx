import React from 'react'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { DialogForm } from '../../dialog-form'
import { CrawlerForm } from './crawler-form'
import { useCrawlerActions } from './use-crawler-actions'

interface CrawlerAddDialogProps {
  libraryId: string
  ref: React.RefObject<HTMLDialogElement | null>
  onSuccess?: (newCrawlerId: string) => void
}

export const CrawlerAddDialog = ({ libraryId, ref, onSuccess }: CrawlerAddDialogProps) => {
  const { t } = useTranslation()

  const { addCrawler, isPending } = useCrawlerActions({ libraryId })

  const handleAddSubmit = async (formData: FormData) => {
    addCrawler(
      { data: formData },
      {
        onSuccess: (data) => {
          if (ref.current) {
            ref.current.close()
          }
          onSuccess?.(data.createAiLibraryCrawler.id)
        },
      },
    )
  }

  return (
    <DialogForm
      ref={ref}
      title={t('crawlers.addNew')}
      onSubmit={handleAddSubmit}
      disabledSubmit={isPending}
      submitButtonText={t('actions.create')}
      className="modal-box max-h-[90vh] max-w-4xl"
    >
      <div className="max-h-[90vh] overflow-y-auto">
        <CrawlerForm libraryId={libraryId} />
      </div>
    </DialogForm>
  )
}
