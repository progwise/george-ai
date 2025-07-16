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
  const [crawlerActive, setCrawlerActive] = useState(true)

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    updateCrawlerMutation({ data: formData })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="">
          <Input
            name="url"
            value={crawler?.url ?? 'https://'}
            label={t('crawlers.url')}
            schema={crawlerFormSchema}
            disabled={isPending}
          />
          <div className="flex flex-row gap-2">
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
        <div className="flex flex-col gap-2">
          <fieldset className="fieldset">
            <label className="label text-base-content mt-4 font-semibold">
              <input type="hidden" name="cronjob.active" value={crawlerActive ? 'true' : 'false'} />
              <input
                defaultChecked={crawlerActive}
                type="checkbox"
                className="checkbox checkbox-sm"
                onChange={(event) => setCrawlerActive(event.currentTarget.checked)}
              />
              {t('crawlers.cronJobActive')}
            </label>
          </fieldset>

          <div className={twMerge('contents', !crawlerActive && 'disabled')}>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">{t('crawlers.cronJobTime')}</legend>
              <input
                type="time"
                name="cronjob.time"
                className="input w-full"
                required={crawlerActive}
                defaultValue={crawler?.cronJob ? formatTime(crawler.cronJob.hour, crawler.cronJob.minute) : '00:00'}
              />
              <p className="label">{t('crawlers.utcHint')}</p>
            </fieldset>

            <fieldset className="fieldset flex flex-col flex-wrap gap-2 md:flex-row">
              <legend className="fieldset-legend">{t('crawlers.days')}</legend>

              <label className="label">
                <input
                  name="cronjob.monday"
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  defaultChecked={crawler?.cronJob?.monday ?? true}
                />
                {t('labels.monday')}
              </label>

              <label className="label">
                <input
                  name="cronjob.tuesday"
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  defaultChecked={crawler?.cronJob?.tuesday ?? true}
                />
                {t('labels.tuesday')}
              </label>

              <label className="label">
                <input
                  name="cronjob.wednesday"
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  defaultChecked={crawler?.cronJob?.wednesday ?? true}
                />
                {t('labels.wednesday')}
              </label>

              <label className="label">
                <input
                  name="cronjob.thursday"
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  defaultChecked={crawler?.cronJob?.thursday ?? true}
                />
                {t('labels.thursday')}
              </label>

              <label className="label">
                <input
                  name="cronjob.friday"
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  defaultChecked={crawler?.cronJob?.friday ?? true}
                />
                {t('labels.friday')}
              </label>

              <label className="label">
                <input
                  name="cronjob.saturday"
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  defaultChecked={crawler?.cronJob?.saturday ?? true}
                />
                {t('labels.saturday')}
              </label>

              <label className="label">
                <input
                  name="cronjob.sunday"
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  defaultChecked={crawler?.cronJob?.sunday ?? true}
                />
                {t('labels.sunday')}
              </label>
            </fieldset>
          </div>

          {crawler?.id && <input type="hidden" name="id" value={crawler.id} />}
        </div>
      </div>
      <button type="submit" className="btn btn-primary btn-sm mt-4" disabled={isPending}>
        {t('crawlers.updateCrawler')}
      </button>
    </form>
  )
}
