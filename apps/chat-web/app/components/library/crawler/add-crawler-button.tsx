import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { useRef, useState } from 'react'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { AiLibraryCrawlerCronJobInputSchema } from '../../../gql/validation'
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
  cronJob: AiLibraryCrawlerCronJobInputSchema().optional(),
})

const addCrawlerFunction = createServerFn({ method: 'POST' })
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

    return createCrawlerFormSchema.parse({
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
  const [crawlerActive, setCrawlerActive] = useState(true)
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

          <fieldset className={crawlerActive ? undefined : 'hidden'}>
            <label className="form-control">
              <div className="label">
                <span className="label-text">{t('crawlers.cronJobTime')}</span>
              </div>
              <input
                type="time"
                name="cronjob.time"
                className="input input-bordered w-full"
                required={crawlerActive}
                defaultValue="00:00"
              />
              <div className="label">
                <span className="label-text-alt">{t('crawlers.utcHint')}</span>
              </div>
            </label>

            <div className="from-control">
              <label className="label cursor-pointer">
                <span className="label-text">{t('labels.monday')}</span>
                <input name="cronjob.monday" type="checkbox" className="checkbox checkbox-sm" defaultChecked />
              </label>
            </div>

            <div className="from-control">
              <label className="label cursor-pointer">
                <span className="label-text">{t('labels.tuesday')}</span>
                <input name="cronjob.tuesday" type="checkbox" className="checkbox checkbox-sm" defaultChecked />
              </label>
            </div>

            <div className="from-control">
              <label className="label cursor-pointer">
                <span className="label-text">{t('labels.wednesday')}</span>
                <input name="cronjob.wednesday" type="checkbox" className="checkbox checkbox-sm" defaultChecked />
              </label>
            </div>

            <div className="from-control">
              <label className="label cursor-pointer">
                <span className="label-text">{t('labels.thursday')}</span>
                <input name="cronjob.thursday" type="checkbox" className="checkbox checkbox-sm" defaultChecked />
              </label>
            </div>

            <div className="from-control">
              <label className="label cursor-pointer">
                <span className="label-text">{t('labels.friday')}</span>
                <input name="cronjob.friday" type="checkbox" className="checkbox checkbox-sm" defaultChecked />
              </label>
            </div>

            <div className="from-control">
              <label className="label cursor-pointer">
                <span className="label-text">{t('labels.saturday')}</span>
                <input name="cronjob.saturday" type="checkbox" className="checkbox checkbox-sm" defaultChecked />
              </label>
            </div>

            <div className="from-control">
              <label className="label cursor-pointer">
                <span className="label-text">{t('labels.sunday')}</span>
                <input name="cronjob.sunday" type="checkbox" className="checkbox checkbox-sm" defaultChecked />
              </label>
            </div>
          </fieldset>

          <input type="hidden" name="libraryId" value={libraryId} />
        </div>
      </DialogForm>
    </>
  )
}
