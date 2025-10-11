import { useRef } from 'react'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { PlusIcon } from '../../../icons/plus-icon'
import { DialogForm } from '../../dialog-form'
import { CrawlerForm } from './crawler-form'
import { useCrawlerActions } from './use-crawler-actions'

interface CrawlerActionsBarProps {
  libraryId: string
}

export const CrawlerActionsBar = ({ libraryId }: CrawlerActionsBarProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { t } = useTranslation()
  const { addCrawler, isPending } = useCrawlerActions({ libraryId })

  const handleSubmit = async (formData: FormData) => {
    addCrawler(
      { data: formData },
      {
        onSuccess: () => {
          dialogRef.current?.close()
        },
      },
    )
  }

  return (
    <>
      <ul className="menu menu-xs md:menu-horizontal bg-base-200 rounded-box flex-nowrap items-end shadow-lg md:items-center">
        <li>
          <button type="button" onClick={() => dialogRef.current?.showModal()}>
            <PlusIcon className="h-5 w-5" />
            {t('crawlers.addNew')}
          </button>
        </li>
      </ul>

      <DialogForm
        ref={dialogRef}
        title={t('crawlers.addNew')}
        onSubmit={handleSubmit}
        disabledSubmit={isPending}
        submitButtonText={t('actions.create')}
      >
        <div className="mt-4">
          <CrawlerForm libraryId={libraryId} />
        </div>
      </DialogForm>
    </>
  )
}
