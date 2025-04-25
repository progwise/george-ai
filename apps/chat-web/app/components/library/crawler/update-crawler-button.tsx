import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { FragmentType, graphql, useFragment } from '../../../gql'
import { AiLibraryCrawlerCronJobInputSchema } from '../../../gql/validation'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { backendRequest } from '../../../server-functions/backend'
import { DialogForm } from '../../dialog-form'
import { Input } from '../../form/input'
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

const updateCrawlerFormSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  maxDepth: z.coerce.number().min(0),
  maxPages: z.coerce.number().min(1),
  libraryId: z.string(),
  cronJob: AiLibraryCrawlerCronJobInputSchema().optional(),
})

const updateCrawlerFunction = createServerFn({ method: 'POST' })
  .validator((data: FormData) => {
    const {
      'cronjob.active': cronJobActive,
      'cronjob.time': cronJobTime,
      'cronjob.monday': cronJobMonday,
      'cronjob.tuesday': cronJobTuesday,
      'cronjob.wednesday': cronJobWednesday,
      'cronjob.thursday': cronJobThursday,
      'cronjob.friday': cronJobFriday,
      'cronjob.saturday': cronJobSaturday,
      'cronjob.sunday': cronJobSunday,
      ...dataObject
    } = Object.fromEntries(data)

    const [hour, minute] = cronJobTime.toString().split(':').map(Number)

    return updateCrawlerFormSchema.parse({
      ...dataObject,
      cronJob: cronJobActive
        ? {
            active: true,
            hour,
            minute,
            monday: cronJobMonday === 'on',
            tuesday: cronJobTuesday === 'on',
            wednesday: cronJobWednesday === 'on',
            thursday: cronJobThursday === 'on',
            friday: cronJobFriday === 'on',
            saturday: cronJobSaturday === 'on',
            sunday: cronJobSunday === 'on',
          }
        : undefined,
    })
  })
  .handler((ctx) => {
    return backendRequest(
      graphql(`
        mutation updateAiLibraryCrawler(
          $id: String!
          $libraryId: String!
          $maxDepth: Int!
          $maxPages: Int!
          $url: String!
          $cronJob: AiLibraryCrawlerCronJobInput
        ) {
          updateAiLibraryCrawler(
            id: $id
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

interface UpdateCrawlerButtonProps {
  libraryId: string
  crawler: FragmentType<typeof UpdateCrawlerButton_CrawlerFragment>
}

export const UpdateCrawlerButton = (props: UpdateCrawlerButtonProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()
  const crawler = useFragment(UpdateCrawlerButton_CrawlerFragment, props.crawler)
  const [crawlerActive, setCrawlerActive] = useState(!!crawler.cronJob?.active)
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

  // Format time for the time input (HH:MM)
  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  }

  return (
    <>
      <button className="btn btn-outline btn-xs" type="button" onClick={() => dialogRef.current?.showModal()}>
        {t('actions.edit')}
      </button>

      <DialogForm
        ref={dialogRef}
        title={t('crawlers.update')}
        onSubmit={handleSubmit}
        disabledSubmit={isPending}
        submitButtonText={t('actions.update')}
      >
        <div className="flex w-full flex-col gap-4">
          <Input
            name="url"
            value={crawler.url}
            label={t('crawlers.url')}
            schema={updateCrawlerFormSchema}
            readOnly={isPending}
          />
          <Input
            name="maxDepth"
            type="number"
            value={crawler.maxDepth}
            label={t('crawlers.maxDepth')}
            schema={updateCrawlerFormSchema}
            readOnly={isPending}
          />
          <Input
            name="maxPages"
            type="number"
            value={crawler.maxPages}
            label={t('crawlers.maxPages')}
            schema={updateCrawlerFormSchema}
            readOnly={isPending}
          />

          <hr />

          <div className="from-control">
            <label className="label cursor-pointer">
              <span className="label-text">{t('crawlers.cronJobActive')}</span>
              <input
                name="cronjob.active"
                defaultChecked={crawlerActive}
                type="checkbox"
                className="checkbox checkbox-sm"
                onChange={(event) => setCrawlerActive(event.currentTarget.checked)}
              />
            </label>
          </div>

          <fieldset className={twMerge('contents', !crawlerActive && 'hidden')}>
            <label className="form-control">
              <div className="label">
                <span className="label-text">{t('crawlers.cronJobTime')}</span>
              </div>
              <input
                type="time"
                name="cronjob.time"
                className="input input-bordered w-full"
                required={crawlerActive}
                defaultValue={crawler.cronJob ? formatTime(crawler.cronJob.hour, crawler.cronJob.minute) : '00:00'}
              />
              <div className="label">
                <span className="label-text-alt">{t('crawlers.utcHint')}</span>
              </div>
            </label>

            <div>
              <div className="from-control">
                <label className="label cursor-pointer">
                  <span className="label-text">{t('labels.monday')}</span>
                  <input
                    name="cronjob.monday"
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    defaultChecked={crawler.cronJob?.monday ?? true}
                  />
                </label>
              </div>

              <div className="from-control">
                <label className="label cursor-pointer">
                  <span className="label-text">{t('labels.tuesday')}</span>
                  <input
                    name="cronjob.tuesday"
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    defaultChecked={crawler.cronJob?.tuesday ?? true}
                  />
                </label>
              </div>

              <div className="from-control">
                <label className="label cursor-pointer">
                  <span className="label-text">{t('labels.wednesday')}</span>
                  <input
                    name="cronjob.wednesday"
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    defaultChecked={crawler.cronJob?.wednesday ?? true}
                  />
                </label>
              </div>

              <div className="from-control">
                <label className="label cursor-pointer">
                  <span className="label-text">{t('labels.thursday')}</span>
                  <input
                    name="cronjob.thursday"
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    defaultChecked={crawler.cronJob?.thursday ?? true}
                  />
                </label>
              </div>

              <div className="from-control">
                <label className="label cursor-pointer">
                  <span className="label-text">{t('labels.friday')}</span>
                  <input
                    name="cronjob.friday"
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    defaultChecked={crawler.cronJob?.friday ?? true}
                  />
                </label>
              </div>

              <div className="from-control">
                <label className="label cursor-pointer">
                  <span className="label-text">{t('labels.saturday')}</span>
                  <input
                    name="cronjob.saturday"
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    defaultChecked={crawler.cronJob?.saturday ?? true}
                  />
                </label>
              </div>

              <div className="from-control">
                <label className="label cursor-pointer">
                  <span className="label-text">{t('labels.sunday')}</span>
                  <input
                    name="cronjob.sunday"
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    defaultChecked={crawler.cronJob?.sunday ?? true}
                  />
                </label>
              </div>
            </div>
          </fieldset>

          <input type="hidden" name="libraryId" value={props.libraryId} />
          <input type="hidden" name="id" value={crawler.id} />
        </div>
      </DialogForm>
    </>
  )
}
