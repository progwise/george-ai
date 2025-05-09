import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { useRef } from 'react'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { backendRequest } from '../../../server-functions/backend'
import { DialogForm } from '../../dialog-form'
import { CrawlerForm, crawlerFormSchema, getCrawlerFormData } from './crawler-form'
import { getCrawlersQueryOptions } from './get-crawlers'

const addCrawlerFunction = createServerFn({ method: 'POST' })
  .validator(({ libraryId, formData }: { libraryId: string; formData: FormData }) => {
    return z
      .object({
        libraryId: z.string().nonempty(),
        formData: crawlerFormSchema,
      })
      .parse({ libraryId, formData: getCrawlerFormData(formData) })
  })
  .handler((ctx) => {
    const { libraryId, formData } = ctx.data
    return backendRequest(
      graphql(`
        mutation createAiLibraryCrawler($libraryId: String!, $data: AiLibraryCrawlerInput!) {
          createAiLibraryCrawler(libraryId: $libraryId, data: $data) {
            id
          }
        }
      `),
      { libraryId, data: formData },
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
    addCrawlerMutation.mutate({ data: { libraryId, formData } })
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
        <CrawlerForm isPending={isPending} />
      </DialogForm>
    </>
  )
}
