import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { formatTime } from '@george-ai/web-utils'

import { Input } from '../../../../../../components/form/input'
import { getCrawlerQueryOptions } from '../../../../../../components/library/crawler/get-crawler'
import { getCrawlersQueryOptions } from '../../../../../../components/library/crawler/get-crawlers'
import { updateCrawlerFunction } from '../../../../../../components/library/crawler/update-crawler'
import { AiLibraryCrawlerCronJobInputSchema } from '../../../../../../gql/validation'
import { useTranslation } from '../../../../../../i18n/use-translation-hook'

const crawlerFormSchema = z.object({
  id: z.string().optional(),
  url: z.string().url(),
  maxDepth: z.coerce.number().min(0),
  maxPages: z.coerce.number().min(1),
  cronJob: AiLibraryCrawlerCronJobInputSchema().optional(),
})

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
    mutationFn: updateCrawlerFunction,
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries(getCrawlerQueryOptions(params)),
        queryClient.invalidateQueries(getCrawlersQueryOptions(params.libraryId)),
      ])
    },
  })
  const [crawlerActive, setCrawlerActive] = useState(!!crawler.cronJob?.active)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    updateCrawlerMutation({ data: formData })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Left Column - URL and Crawl Settings */}
        <div className="space-y-4">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="card-title mb-4 text-lg">{t('crawlers.crawlSettings')}</h3>

              <Input
                name="url"
                value={crawler?.url ?? 'https://'}
                label={t('crawlers.url')}
                schema={crawlerFormSchema}
                disabled={isPending}
                className="mb-4"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="maxDepth"
                  type="number"
                  value={crawler?.maxDepth ?? 2}
                  label={t('crawlers.maxDepth')}
                  schema={crawlerFormSchema}
                  disabled={isPending}
                />
                <Input
                  name="maxPages"
                  type="number"
                  value={crawler?.maxPages ?? 10}
                  label={t('crawlers.maxPages')}
                  schema={crawlerFormSchema}
                  disabled={isPending}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Cron Schedule */}
        <div className="space-y-4">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h3 className="card-title mb-4 text-lg">{t('crawlers.cronSchedule')}</h3>

              <label className="label mb-4 cursor-pointer justify-start gap-3 p-0">
                <input type="hidden" name="cronjob.active" value={crawlerActive ? 'true' : 'false'} />
                <input
                  defaultChecked={!!crawler.cronJob?.active}
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  onChange={(event) => setCrawlerActive(event.currentTarget.checked)}
                />
                <span className="label-text font-medium">{t('crawlers.cronJobActive')}</span>
              </label>

              <div className={twMerge('space-y-4', !crawlerActive && 'pointer-events-none opacity-50')}>
                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t('crawlers.cronJobTime')}</span>
                  </label>
                  <input
                    type="time"
                    name="cronjob.time"
                    className="input input-bordered w-full"
                    required={crawlerActive}
                    defaultValue={crawler?.cronJob ? formatTime(crawler.cronJob.hour, crawler.cronJob.minute) : '00:00'}
                  />
                  <label className="label">
                    <span className="label-text-alt">{t('crawlers.utcHint')}</span>
                  </label>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">{t('crawlers.days')}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <label key={day} className="label cursor-pointer justify-start gap-2 p-0">
                        <input
                          name={`cronjob.${day}`}
                          type="checkbox"
                          className="checkbox checkbox-sm checkbox-primary"
                          defaultChecked={!!crawler?.cronJob?.[day as keyof typeof crawler.cronJob]}
                        />
                        <span className="label-text">{t(`labels.${day}`)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {crawler?.id && <input type="hidden" name="id" value={crawler.id} />}

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
