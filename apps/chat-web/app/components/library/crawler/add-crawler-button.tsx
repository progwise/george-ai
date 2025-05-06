import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { useRef } from 'react'

import { graphql } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { backendRequest } from '../../../server-functions/backend'
import { DialogForm } from '../../dialog-form'
import { CrawlerForm, crawlerFormSchema, getCrawlerFormData } from './crawler-form'
import { getCrawlersQueryOptions } from './get-crawlers'

const addCrawlerFunction = createServerFn({ method: 'POST' })
  .validator((data: FormData) => {
    return crawlerFormSchema.parse(getCrawlerFormData(data))
  })
  .handler((ctx) => {
    return backendRequest(
      graphql(`
        mutation createAiLibraryCrawler(
          $libraryId: String!
          $maxDepth: Int!
          $maxPages: Int!
          $url: String!
          $cronJob: AiLibraryCrawlerCronJobInput
        ) {
          createAiLibraryCrawler(
            libraryId: $libraryId
            maxDepth: $maxDepth
            maxPages: $maxPages
            url: $url
            cronJob: $cronJob
          ) {
            id
          }
        }
      `),
      ctx.data,
    )
  })

interface AddCrawlerButtonProps {
  libraryId: string
}

export const AddCrawlerButton = ({ libraryId }: AddCrawlerButtonProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const addCrawlerMutation = useMutation({
    mutationFn: addCrawlerFunction,
    onSuccess: async () => {
      await queryClient.invalidateQueries(getCrawlersQueryOptions(libraryId))
      dialogRef.current?.close()
    },
  })
  const isPending = addCrawlerMutation.isPending

  const handleSubmit = (formData: FormData) => {
    addCrawlerMutation.mutate({ data: formData })
  }

  return (
    <>
      <button className="btn btn-primary btn-xs" type="button" onClick={() => dialogRef.current?.showModal()}>
        {t('crawlers.addNew')}
      </button>

      <DialogForm
        ref={dialogRef}
        title={t('crawlers.addNew')}
        onSubmit={handleSubmit}
        disabledSubmit={isPending}
        submitButtonText={t('actions.create')}
      >
        <CrawlerForm libraryId={libraryId} isPending={isPending} />
      </DialogForm>
    </>
  )
}
