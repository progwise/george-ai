import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { useRef } from 'react'

import { graphql } from '../../../gql'
import { UpdateCrawlerButton_CrawlerFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { EditIcon } from '../../../icons/edit-icon'
import { backendRequest } from '../../../server-functions/backend'
import { DialogForm } from '../../dialog-form'
import { CrawlerForm, crawlerFormSchema, getCrawlerFormData } from './crawler-form'
import { getCrawlersQueryOptions } from './get-crawlers'
import { updateCrawlerFunction } from './update-crawler'

graphql(`
  fragment UpdateCrawlerButton_Crawler on AiLibraryCrawler {
    id
    url
    maxDepth
    maxPages
    cronJob {
      id
      active
      hour
      minute
      monday
      tuesday
      wednesday
      thursday
      friday
      saturday
      sunday
    }
  }
`)

interface UpdateCrawlerButtonProps {
  libraryId: string
  crawler: UpdateCrawlerButton_CrawlerFragment
}

export const UpdateCrawlerButton = ({ libraryId, crawler }: UpdateCrawlerButtonProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: updateCrawlerMutation, isPending } = useMutation({
    mutationFn: updateCrawlerFunction,
    onSuccess: async () => {
      await queryClient.invalidateQueries(getCrawlersQueryOptions(libraryId))
      dialogRef.current?.close()
    },
  })

  const handleSubmit = (formData: FormData) => {
    updateCrawlerMutation({ data: formData })
  }

  const initialData = {
    id: crawler.id,
    url: crawler.url,
    maxDepth: crawler.maxDepth,
    maxPages: crawler.maxPages,
    cronJob: crawler.cronJob
      ? {
          active: crawler.cronJob.active,
          hour: crawler.cronJob.hour,
          minute: crawler.cronJob.minute,
          monday: crawler.cronJob.monday,
          tuesday: crawler.cronJob.tuesday,
          wednesday: crawler.cronJob.wednesday,
          thursday: crawler.cronJob.thursday,
          friday: crawler.cronJob.friday,
          saturday: crawler.cronJob.saturday,
          sunday: crawler.cronJob.sunday,
        }
      : undefined,
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-xs lg:tooltip"
        data-tip={t('tooltips.edit')}
        onClick={() => dialogRef.current?.showModal()}
      >
        <EditIcon className="size-5" />
      </button>

      <DialogForm
        ref={dialogRef}
        title={t('crawlers.update')}
        onSubmit={handleSubmit}
        disabledSubmit={isPending}
        submitButtonText={t('actions.update')}
      >
        <CrawlerForm initialData={initialData} isPending={isPending} />
      </DialogForm>
    </>
  )
}
