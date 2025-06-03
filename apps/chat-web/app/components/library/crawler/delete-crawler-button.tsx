import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { useRef } from 'react'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { TrashIcon } from '../../../icons/trash-icon'
import { backendRequest } from '../../../server-functions/backend'
import { DialogForm } from '../../dialog-form'
import { getCrawlersQueryOptions } from './get-crawlers'

const deleteCrawlerFunction = createServerFn({ method: 'POST' })
  .validator((data: string) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        mutation deleteCrawler($id: String!) {
          deleteAiLibraryCrawler(id: $id) {
            id
          }
        }
      `),
      { id: ctx.data },
    )
  })

interface DeleteCrawlerButtonProps {
  crawlerId: string
  crawlerUrl: string
  filesCount: number
  libraryId: string
}

export const DeleteCrawlerButton = ({ crawlerId, crawlerUrl, filesCount, libraryId }: DeleteCrawlerButtonProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: deleteCrawlerMutation, isPending } = useMutation({
    mutationFn: () => deleteCrawlerFunction({ data: crawlerId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries(getCrawlersQueryOptions(libraryId))
      dialogRef.current?.close()
    },
  })

  const handleSubmit = () => {
    deleteCrawlerMutation()
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-xs tooltip tooltip-left"
        data-tip={t('tooltips.delete')}
        onClick={() => dialogRef.current?.showModal()}
      >
        <TrashIcon />
      </button>

      <DialogForm
        ref={dialogRef}
        title={t('crawlers.delete')}
        description={
          <div
            // eslint-disable-next-line @eslint-react/dom/no-dangerously-set-innerhtml
            dangerouslySetInnerHTML={{
              __html: t('crawlers.deleteConfirmation', {
                crawlerUrl: `<span class="font-bold">${encodeURIComponent(crawlerUrl)}</span>`,
                filesCount,
              }),
            }}
          />
        }
        onSubmit={handleSubmit}
        disabledSubmit={isPending}
        submitButtonText={t('actions.delete')}
      />
    </>
  )
}
