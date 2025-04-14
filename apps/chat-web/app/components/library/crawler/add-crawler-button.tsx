import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { useRef } from 'react'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { backendRequest } from '../../../server-functions/backend'
import { DialogForm } from '../../dialog-form'
import { Input } from '../../form/input'
import { getCrawlersQueryOptions } from './get-crawlers'

const createCrawlerFormSchema = z.object({
  url: z.string().url(),
  maxDepth: z.coerce.number().min(0),
  maxPages: z.coerce.number().min(1),
  libraryId: z.string(),
})

const addCrawlerFunction = createServerFn({ method: 'POST' })
  .validator((data: FormData) => {
    const dataObject = Object.fromEntries(data)
    return createCrawlerFormSchema.parse(dataObject)
  })
  .handler((ctx) => {
    return backendRequest(
      graphql(`
        mutation createAiLibraryCrawler($libraryId: String!, $maxDepth: Int!, $maxPages: Int!, $url: String!) {
          createAiLibraryCrawler(libraryId: $libraryId, maxDepth: $maxDepth, maxPages: $maxPages, url: $url) {
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
      <button className="btn btn-xs" type="button" onClick={() => dialogRef.current?.showModal()}>
        {t('crawlers.addNew')}
      </button>

      <DialogForm
        ref={dialogRef}
        title={t('crawlers.addNew')}
        onSubmit={handleSubmit}
        disabledSubmit={isPending}
        submitButtonText={t('actions.create')}
      >
        <div className="flex w-full flex-col gap-4">
          <Input
            name="url"
            placeholder="https://"
            label={t('crawlers.url')}
            schema={createCrawlerFormSchema}
            readOnly={isPending}
          />
          <Input
            name="maxDepth"
            type="number"
            value={2}
            label={t('crawlers.maxDepth')}
            schema={createCrawlerFormSchema}
            readOnly={isPending}
          />
          <Input
            name="maxPages"
            type="number"
            value={10}
            label={t('crawlers.maxPages')}
            schema={createCrawlerFormSchema}
            readOnly={isPending}
          />

          <input type="hidden" name="libraryId" value={libraryId} />
        </div>
      </DialogForm>
    </>
  )
}
