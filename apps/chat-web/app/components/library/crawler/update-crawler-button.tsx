import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { useRef } from 'react'

import { FragmentType, graphql, useFragment } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { backendRequest } from '../../../server-functions/backend'
import { DialogForm } from '../../dialog-form'
import { CrawlerForm, crawlerFormSchema, getCrawlerFormData } from './crawler-form'
import { getCrawlersQueryOptions } from './get-crawlers'

const UpdateCrawlerButton_CrawlerFragment = graphql(`
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

const updateCrawlerFunction = createServerFn({ method: 'POST' })
  .validator((data: FormData) => {
    return crawlerFormSchema.parse(getCrawlerFormData(data))
  })
  .handler((ctx) => {
    const input = ctx.data
    const id = input.id

    return backendRequest(
      graphql(`
        mutation updateAiLibraryCrawler($id: String!, $input: AiLibraryCrawlerInput!) {
          updateAiLibraryCrawler(id: $id, input: $input) {
            id
          }
        }
      `),
      {
        id,
        input: {
          url: input.url,
          maxDepth: input.maxDepth,
          maxPages: input.maxPages,
          libraryId: input.libraryId,
          cronJob: input.cronJob,
        },
      },
    )
  })

interface UpdateCrawlerButtonProps {
  libraryId: string
  crawler: FragmentType<typeof UpdateCrawlerButton_CrawlerFragment>
}

export const UpdateCrawlerButton = (props: UpdateCrawlerButtonProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()
  const crawler = useFragment(UpdateCrawlerButton_CrawlerFragment, props.crawler)
  const { t } = useTranslation()

  const { mutate: updateCrawlerMutation, isPending } = useMutation({
    mutationFn: updateCrawlerFunction,
    onSuccess: async () => {
      await queryClient.invalidateQueries(getCrawlersQueryOptions(props.libraryId))
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
        {t('actions.edit')}
      </button>

      <DialogForm
        ref={dialogRef}
        title={t('crawlers.update')}
        onSubmit={handleSubmit}
        disabledSubmit={isPending}
        submitButtonText={t('actions.update')}
      >
        <CrawlerForm initialData={initialData} libraryId={props.libraryId} isPending={isPending} />
      </DialogForm>
    </>
  )
}
