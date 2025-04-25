import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { AiLibraryCrawlerCronJobInputSchema } from '../../../gql/validation'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { Input } from '../../form/input'

export const crawlerFormSchema = z.object({
  id: z.string().optional(),
  url: z.string().url(),
  maxDepth: z.coerce.number().min(0),
  maxPages: z.coerce.number().min(1),
  libraryId: z.string(),
  cronJob: AiLibraryCrawlerCronJobInputSchema().optional(),
})

export const getCrawlerFormData = (formData: FormData) => {
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
  } = Object.fromEntries(formData)

  const [hour, minute] = cronJobTime.toString().split(':').map(Number)

  return {
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
  }
}

export interface CrawlerFormData {
  id?: string
  url: string
  maxDepth: number
  maxPages: number
  cronJob?: {
    active: boolean
    hour: number
    minute: number
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
  }
}

interface CrawlerFormProps {
  initialData?: CrawlerFormData
  libraryId: string
  isPending: boolean
}

export const CrawlerForm = ({ initialData, libraryId, isPending }: CrawlerFormProps) => {
  const { t } = useTranslation()
  const [crawlerActive, setCrawlerActive] = useState(initialData?.cronJob?.active ?? true)

  // Format time for the time input (HH:MM)
  const formatTime = (hour: number = 0, minute: number = 0) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <Input
        name="url"
        value={initialData?.url ?? 'https://'}
        label={t('crawlers.url')}
        schema={crawlerFormSchema}
        readOnly={isPending}
      />
      <Input
        name="maxDepth"
        type="number"
        value={initialData?.maxDepth ?? 2}
        label={t('crawlers.maxDepth')}
        schema={crawlerFormSchema}
        readOnly={isPending}
      />
      <Input
        name="maxPages"
        type="number"
        value={initialData?.maxPages ?? 10}
        label={t('crawlers.maxPages')}
        schema={crawlerFormSchema}
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
            defaultValue={
              initialData?.cronJob ? formatTime(initialData.cronJob.hour, initialData.cronJob.minute) : '00:00'
            }
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
                defaultChecked={initialData?.cronJob?.monday ?? true}
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
                defaultChecked={initialData?.cronJob?.tuesday ?? true}
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
                defaultChecked={initialData?.cronJob?.wednesday ?? true}
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
                defaultChecked={initialData?.cronJob?.thursday ?? true}
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
                defaultChecked={initialData?.cronJob?.friday ?? true}
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
                defaultChecked={initialData?.cronJob?.saturday ?? true}
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
                defaultChecked={initialData?.cronJob?.sunday ?? true}
              />
            </label>
          </div>
        </div>
      </fieldset>

      <input type="hidden" name="libraryId" value={libraryId} />
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
    </div>
  )
}
