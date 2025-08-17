import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import React from 'react'

import { toastError, toastSuccess } from '../../../../../../components/georgeToaster'
import { CrawlerForm } from '../../../../../../components/library/crawler/crawler-form'
import { getCrawlerQueryOptions } from '../../../../../../components/library/crawler/get-crawler'
import { getCrawlersQueryOptions } from '../../../../../../components/library/crawler/get-crawlers'
import { updateCrawler } from '../../../../../../components/library/crawler/update-crawler'
import { useTranslation } from '../../../../../../i18n/use-translation-hook'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/crawlers/$crawlerId/')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(getCrawlerQueryOptions(params))
  },
})

function RouteComponent() {
  const { t } = useTranslation()
  const params = Route.useParams()
  const { queryClient } = Route.useRouteContext()

  const {
    data: { aiLibraryCrawler: crawler },
  } = useSuspenseQuery(getCrawlerQueryOptions(params))
  const { mutate: updateCrawlerMutation, isPending } = useMutation({
    mutationFn: updateCrawler,
    onError: (error) => {
      toastError(`${t('crawlers.toastUpdateError')}: ${error.message}`)
    },
    onSuccess: () => {
      toastSuccess(t('crawlers.toastUpdateSuccess'))
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries(getCrawlerQueryOptions(params)),
        queryClient.invalidateQueries(getCrawlersQueryOptions(params.libraryId)),
      ])
    },
  })
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    updateCrawlerMutation({ data: formData })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
      <CrawlerForm libraryId={params.libraryId} crawler={crawler} />

      <div className="mt-6 flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              {t('actions.saving')}
            </>
          ) : (
            t('crawlers.updateCrawler')
          )}
        </button>
      </div>
    </form>
  )
}
