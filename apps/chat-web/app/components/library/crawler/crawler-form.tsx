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
          active: cronJobActive === 'true',
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
  } | null
}

interface CrawlerFormProps {
  initialData?: CrawlerFormData
  isPending: boolean
  className?: string
}

export const CrawlerForm = ({ initialData, isPending, className }: CrawlerFormProps) => {
  const { t } = useTranslation()
  const [crawlerActive, setCrawlerActive] = useState(initialData ? !!initialData.cronJob?.active : true)

  // Format time for the time input (HH:MM)
  const formatTime = (hour: number = 0, minute: number = 0) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  }

  return (
    <div className={twMerge('grid grid-cols-1 gap-8 lg:grid-cols-2', className)}>
      <Input
        name="url"
        value={initialData?.url ?? 'https://'}
        label={t('crawlers.url')}
        schema={crawlerFormSchema}
        disabled={isPending}
        className="col-span-1 lg:col-span-2"
      />
      <Input
        name="url"
        value={initialData?.url ?? 'https://'}
        label={t('crawlers.url')}
        schema={crawlerFormSchema}
        disabled={isPending}
        className="col-span-1 lg:col-span-2"
      />
      <div className="flex flex-row gap-2">
        <Input
          name="maxDepth"
          type="number"
          value={initialData?.maxDepth ?? 2}
          label={t('crawlers.maxDepth')}
          schema={crawlerFormSchema}
          disabled={isPending}
        />
        <Input
          name="maxPages"
          type="number"
          value={initialData?.maxPages ?? 10}
          label={t('crawlers.maxPages')}
          schema={crawlerFormSchema}
          disabled={isPending}
        />
      </div>
      <div className="flex flex-col gap-2">
        <fieldset className="fieldset">
          <label className="label text-base-content mt-4 font-semibold">
            <input
              name="cronjob.active"
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
              defaultValue={
                initialData?.cronJob ? formatTime(initialData.cronJob.hour, initialData.cronJob.minute) : '00:00'
              }
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
                defaultChecked={initialData?.cronJob?.monday ?? true}
              />
              {t('labels.monday')}
            </label>

            <label className="label">
              <input
                name="cronjob.tuesday"
                type="checkbox"
                className="checkbox checkbox-sm"
                defaultChecked={initialData?.cronJob?.tuesday ?? true}
              />
              {t('labels.tuesday')}
            </label>

            <label className="label">
              <input
                name="cronjob.wednesday"
                type="checkbox"
                className="checkbox checkbox-sm"
                defaultChecked={initialData?.cronJob?.wednesday ?? true}
              />
              {t('labels.wednesday')}
            </label>

            <label className="label">
              <input
                name="cronjob.thursday"
                type="checkbox"
                className="checkbox checkbox-sm"
                defaultChecked={initialData?.cronJob?.thursday ?? true}
              />
              {t('labels.thursday')}
            </label>

            <label className="label">
              <input
                name="cronjob.friday"
                type="checkbox"
                className="checkbox checkbox-sm"
                defaultChecked={initialData?.cronJob?.friday ?? true}
              />
              {t('labels.friday')}
            </label>

            <label className="label">
              <input
                name="cronjob.saturday"
                type="checkbox"
                className="checkbox checkbox-sm"
                defaultChecked={initialData?.cronJob?.saturday ?? true}
              />
              {t('labels.saturday')}
            </label>

            <label className="label">
              <input
                name="cronjob.sunday"
                type="checkbox"
                className="checkbox checkbox-sm"
                defaultChecked={initialData?.cronJob?.sunday ?? true}
              />
              {t('labels.sunday')}
            </label>
          </fieldset>
        </div>

        {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
      </div>
    </div>
  )
}
