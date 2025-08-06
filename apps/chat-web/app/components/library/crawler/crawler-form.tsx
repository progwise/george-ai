import { useMemo, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { HTTP_URI_PATTERN, SHAREPOINT_URI_PATTERN, SMB_URI_PATTERN } from '@george-ai/web-utils'

import { AiLibraryCrawlerCronJobInputSchema } from '../../../gql/validation'
import { Language, translate } from '../../../i18n'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { Input } from '../../form/input'

export const getCrawlerCredentialsSchema = (language: Language) => {
  return z.object({
    username: z.string().min(2, translate('crawlers.validationUsernameRequired', language)),
    password: z.string().min(2, translate('crawlers.validationPasswordRequired', language)),
  })
}
// Base schema for Input component validation
export const getCrawlerFormBaseSchema = (language: Language) =>
  z.object({
    id: z.string().optional(),
    libraryId: z.string().optional(),
    uri: z.string().min(1),
    uriType: z.union([z.literal('http'), z.literal('smb'), z.literal('sharepoint')]),
    maxDepth: z.coerce.number().min(0, translate('crawlers.errors.maxDepth', language)),
    maxPages: z.coerce.number().min(1, translate('crawlers.errors.maxPages', language)),
    cronJob: AiLibraryCrawlerCronJobInputSchema().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    sharepointAuth: z.string().optional(),
  })

// Full schema with refinements for form submission validation
export const getCrawlerFormSchema = (language: Language) =>
  getCrawlerFormBaseSchema(language).refine(
    (data) => {
      if (data.uriType === 'http') {
        return HTTP_URI_PATTERN.test(data.uri)
      } else if (data.uriType === 'smb') {
        return SMB_URI_PATTERN.test(data.uri)
      } else if (data.uriType === 'sharepoint') {
        return SHAREPOINT_URI_PATTERN.test(data.uri)
      }
      return false
    },
    {
      message: translate('crawlers.errors.invalidUri', language),
      path: ['uri'],
    },
  )

export const getCrawlerFormData = (formData: FormData) => {
  const formDataObject = Object.fromEntries(formData)
  console.log('formData', formDataObject)
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
    username,
    password,
    sharepointAuth,
    ...dataObject
  } = formDataObject

  const [hour, minute] = cronJobTime ? cronJobTime.toString().split(':').map(Number) : [0, 0]

  return {
    ...dataObject,
    username: username?.toString(),
    password: password?.toString(),
    sharepointAuth: sharepointAuth?.toString(),
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
  uri: string
  uriType: string
  maxDepth: number
  maxPages: number
  cronJob: {
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
  libraryId: string
}

export const CrawlerForm = ({ libraryId }: CrawlerFormProps) => {
  const { t, language } = useTranslation()
  const [scheduleActive, setScheduleActive] = useState(false)
  const [selectedUriType, setSelectedUriType] = useState<'http' | 'smb' | 'sharepoint'>('http')

  const cronWeekdayFields = useMemo(
    () => ({
      type: 'checkbox',
      className: 'checkbox checkbox-sm',
      defaultChecked: true,
      disabled: !scheduleActive,
    }),
    [scheduleActive],
  )

  // Create dynamic schema based on selected URI type
  const crawlerFormSchema = useMemo(() => {
    const baseSchema = getCrawlerFormBaseSchema(language)

    // Override the uri validation based on selected type
    return z.object({
      ...baseSchema.shape,
      uri:
        selectedUriType === 'http'
          ? z.string().regex(HTTP_URI_PATTERN, translate('crawlers.errors.invalidUri', language))
          : selectedUriType === 'smb'
            ? z.string().regex(SMB_URI_PATTERN, translate('crawlers.errors.invalidUri', language))
            : z.string().regex(SHAREPOINT_URI_PATTERN, translate('crawlers.errors.invalidUri', language)),
    })
  }, [language, selectedUriType])

  const credentialsSchema = useMemo(() => getCrawlerCredentialsSchema(language), [language])

  return (
    <div>
      <input type="hidden" name="libraryId" value={libraryId} />
      <div className="flex justify-end gap-4">
        <label className="flex gap-2 text-xs">
          <input
            type="radio"
            name="uriType"
            value="http"
            className="radio radio-sm"
            defaultChecked
            onChange={() => setSelectedUriType('http')}
            required
          />
          <span>{t('crawlers.uriTypeHtml')}</span>
        </label>
        <label className="flex gap-2 text-xs">
          <input
            type="radio"
            name="uriType"
            value="smb"
            className="radio radio-sm"
            onChange={() => setSelectedUriType('smb')}
          />
          <span>{t('crawlers.uriTypeSmb')}</span>
        </label>
        <label className="flex gap-2 text-xs">
          <input
            type="radio"
            name="uriType"
            value="sharepoint"
            className="radio radio-sm"
            onChange={() => setSelectedUriType('sharepoint')}
          />
          <span>{t('crawlers.uriTypeSharepoint')}</span>
        </label>
      </div>
      <Input
        name="uri"
        placeholder={t('crawlers.placeholders.uri')}
        label={t('crawlers.uri')}
        schema={crawlerFormSchema}
        className=""
        required={true}
      />
      <div className="grid grid-cols-2 gap-2">
        <Input
          name="maxDepth"
          type="number"
          placeholder={t('crawlers.placeholders.maxDepth')}
          label={t('crawlers.maxDepth')}
          schema={crawlerFormSchema}
          required={true}
        />
        <Input
          name="maxPages"
          type="number"
          placeholder={t('crawlers.placeholders.maxPages')}
          label={t('crawlers.maxPages')}
          schema={crawlerFormSchema}
          required={true}
        />
      </div>
      {selectedUriType === 'sharepoint' ? (
        <div className="flex flex-col gap-2">
          <div className="alert alert-info">
            <div className="text-sm">
              <strong>SharePoint Authentication Required:</strong>
              <ol className="mt-2 list-inside list-decimal space-y-1">
                <li>Open your SharePoint site in browser and log in completely</li>
                <li>Open Developer Tools (F12) → Network tab</li>
                <li>Refresh the page or navigate to a document library</li>
                <li>Find any request to your SharePoint site</li>
                <li>Copy the complete 'Cookie' header value (must include FedAuth and rtFa cookies)</li>
                <li>Paste it in the field below</li>
              </ol>
              <div className="mt-2 text-xs opacity-75">
                Note: Cookies are session-based and will expire. You may need to refresh them periodically.
              </div>
            </div>
          </div>
          <Input
            name="sharepointAuth"
            label="SharePoint Authentication Cookies"
            placeholder={t('crawlers.placeholders.sharepointAuth')}
            schema={z.object({ sharepointAuth: z.string().min(10, 'Authentication cookies required') })}
            required
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Input
            disabled={selectedUriType !== 'smb'}
            name="username"
            label={t('crawlers.credentialsUsername')}
            placeholder={t('crawlers.placeholders.username')}
            schema={credentialsSchema}
            required
          />
          <Input
            disabled={selectedUriType !== 'smb'}
            name="password"
            type="password"
            label={t('crawlers.credentialsPassword')}
            placeholder={t('crawlers.placeholders.password')}
            schema={credentialsSchema}
            required
          />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <fieldset className="fieldset flex">
          <label className="label text-base-content mt-4 font-semibold">
            <input
              name="cronjob.active"
              defaultChecked={false}
              type="checkbox"
              className="checkbox checkbox-sm"
              onChange={(event) => setScheduleActive(event.currentTarget.checked)}
            />
            {t('crawlers.cronJobActive')}
          </label>
          <label className="label text-base-content mt-4 font-semibold">
            {t('crawlers.cronJobTime')}
            <input
              type="time"
              name="cronjob.time"
              className="input pr-10"
              required={scheduleActive}
              defaultValue="00:00"
              disabled={!scheduleActive}
            />
            {t('crawlers.utcHint')}
          </label>
        </fieldset>
        <div className={twMerge('', !scheduleActive && 'disabled')}>
          <fieldset className="fieldset flex flex-row flex-wrap gap-2">
            <legend className="fieldset-legend">{t('crawlers.days')}</legend>

            <label className="label">
              <input name="cronjob.monday" {...cronWeekdayFields} />
              {t('labels.monday')}
            </label>

            <label className="label">
              <input name="cronjob.tuesday" {...cronWeekdayFields} />
              {t('labels.tuesday')}
            </label>

            <label className="label">
              <input name="cronjob.wednesday" {...cronWeekdayFields} />
              {t('labels.wednesday')}
            </label>

            <label className="label">
              <input name="cronjob.thursday" {...cronWeekdayFields} />
              {t('labels.thursday')}
            </label>

            <label className="label">
              <input name="cronjob.friday" {...cronWeekdayFields} />
              {t('labels.friday')}
            </label>

            <label className="label">
              <input name="cronjob.saturday" {...cronWeekdayFields} />
              {t('labels.saturday')}
            </label>

            <label className="label">
              <input name="cronjob.sunday" {...cronWeekdayFields} />
              {t('labels.sunday')}
            </label>
          </fieldset>
        </div>
      </div>
    </div>
  )
}
