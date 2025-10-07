import { useMemo, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import {
  BOX_URI_PATTERN,
  HTTP_URI_PATTERN,
  SHAREPOINT_URI_PATTERN,
  SMB_URI_PATTERN,
  jsonArrayToString,
} from '@george-ai/web-utils'

import { graphql } from '../../../gql'
import { CrawlerForm_CrawlerFragment, CrawlerUriType } from '../../../gql/graphql'
import { AiLibraryCrawlerCronJobInputSchema } from '../../../gql/validation'
import { Language, translate } from '../../../i18n'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { Input } from '../../form/input'

const URI_PATTERNS = {
  smb: SMB_URI_PATTERN,
  http: HTTP_URI_PATTERN,
  sharepoint: SHAREPOINT_URI_PATTERN,
  box: BOX_URI_PATTERN,
}

// Base schema for Input component validation
export const getCrawlerFormSchema = (
  editMode: 'add' | 'update',
  uriType: keyof typeof URI_PATTERNS,
  language: Language,
) =>
  z.object({
    id: editMode === 'update' ? z.string().min(2) : z.string().optional(),
    libraryId: z.string().optional(),
    uri: z.string().min(1).regex(URI_PATTERNS[uriType], translate('crawlers.errors.invalidUri', language)),
    uriType: z.nativeEnum(CrawlerUriType),
    maxDepth: z.coerce.number().min(0, translate('crawlers.errors.maxDepth', language)),
    maxPages: z.coerce.number().min(1, translate('crawlers.errors.maxPages', language)),
    // File filtering options
    includePatterns: z.string().optional(),
    excludePatterns: z.string().optional(),
    maxFileSize: z.coerce.number().min(0).optional(),
    minFileSize: z.coerce.number().min(0).optional(),
    allowedMimeTypes: z.string().optional(),
    cronJob: AiLibraryCrawlerCronJobInputSchema().optional(),
    username:
      uriType !== 'smb'
        ? z.string().optional()
        : z.string().min(2, translate('crawlers.validationUsernameRequired', language)),
    password:
      uriType !== 'smb'
        ? z.string().optional()
        : z.string().min(2, translate('crawlers.validationPasswordRequired', language)),
    boxCustomerId:
      uriType != 'box'
        ? z.string().optional()
        : z.string().min(10, translate('crawlers.validationBoxCustomerIdTooShort', language)),
    boxToken:
      uriType != 'box'
        ? z.string().optional()
        : z.string().min(20, translate('crawlers.validationBoxTokenTooShort', language)),
    sharepointAuth:
      uriType != 'sharepoint'
        ? z.string().optional()
        : z
            .string()
            .min(20, translate('crawlers.validationSharePointAuthTooShort', language))
            .refine(
              (value) => {
                // Must contain at least one SharePoint authentication cookie
                const hasTraditionalAuth = value.includes('FedAuth=') || value.includes('rtFa=')
                const hasModernAuth = value.includes('SPOIDCRL=') || value.includes('SPOCC=')
                const hasCustomAuth =
                  value.includes('NTLM') ||
                  value.includes('Negotiate') ||
                  value.includes('SAML') ||
                  value.includes('WSFederation')

                return hasTraditionalAuth || hasModernAuth || hasCustomAuth
              },
              {
                message: translate('crawlers.validationSharePointAuthMissingTokens', language),
              },
            )
            .refine(
              (value) => {
                // Very basic cookie format validation - just check that it looks like cookies
                // Should contain = signs and not start with = (but can end with = for base64 padding)
                return value.includes('=') && !value.startsWith('=') && value.trim().length > 0
              },
              {
                message: translate('crawlers.validationSharePointAuthInvalidFormat', language),
              },
            ),
  })

graphql(`
  fragment CrawlerForm_Crawler on AiLibraryCrawler {
    id
    libraryId
    uri
    uriType
    maxDepth
    maxPages
    includePatterns
    excludePatterns
    maxFileSize
    minFileSize
    allowedMimeTypes
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

interface CrawlerFormProps {
  libraryId: string
  crawler?: CrawlerForm_CrawlerFragment
}

export const CrawlerForm = ({ libraryId, crawler }: CrawlerFormProps) => {
  const { t, language } = useTranslation()
  const [scheduleActive, setScheduleActive] = useState(!!crawler?.cronJob?.active)
  const [selectedUriType, setSelectedUriType] = useState<'http' | 'smb' | 'sharepoint' | 'box'>(
    crawler?.uriType || 'http',
  )
  const [filtersActive, setFiltersActive] = useState(
    !!(
      crawler?.includePatterns ||
      crawler?.excludePatterns ||
      crawler?.maxFileSize ||
      crawler?.minFileSize ||
      crawler?.allowedMimeTypes
    ),
  )

  // Create dynamic schema based on selected URI type
  const crawlerFormSchema = useMemo(() => {
    const schema = getCrawlerFormSchema(!crawler ? 'add' : 'update', selectedUriType, language)
    return schema
  }, [language, selectedUriType, crawler])

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="libraryId" value={libraryId} />
      {crawler?.id && <input type="hidden" name="id" value={crawler.id} />}
      <div className="flex justify-end gap-4">
        <label className="flex gap-2 text-xs">
          <input
            type="radio"
            name="uriType"
            value="http"
            className="radio radio-sm"
            checked={selectedUriType === 'http'}
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
            checked={selectedUriType === 'smb'}
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
            checked={selectedUriType === 'sharepoint'}
            onChange={() => setSelectedUriType('sharepoint')}
          />
          <span>{t('crawlers.uriTypeSharepoint')}</span>
        </label>
        <label className="flex gap-2 text-xs">
          <input
            type="radio"
            name="uriType"
            value="box"
            className="radio radio-sm"
            checked={selectedUriType === 'box'}
            onChange={() => setSelectedUriType('box')}
          />
          <span>{t('crawlers.uriTypeBox')}</span>
        </label>
      </div>
      <Input
        name="uri"
        value={crawler?.uri || ''}
        placeholder={t('crawlers.placeholders.uri')}
        label={t('crawlers.uri')}
        schema={crawlerFormSchema}
        required={true}
      />
      <div className="grid grid-cols-2 gap-2">
        <Input
          name="maxDepth"
          type="number"
          value={crawler?.maxDepth ?? 2}
          placeholder={t('crawlers.placeholders.maxDepth')}
          label={t('crawlers.maxDepth')}
          schema={crawlerFormSchema}
          required={true}
        />
        <Input
          name="maxPages"
          type="number"
          value={crawler?.maxPages ?? 10}
          placeholder={t('crawlers.placeholders.maxPages')}
          label={t('crawlers.maxPages')}
          schema={crawlerFormSchema}
          required={true}
        />
      </div>

      {/* File Filters Section */}
      <div className="flex flex-col gap-2">
        <fieldset className="fieldset flex">
          <label className="label text-base-content mt-4 font-semibold">
            <input
              name="filtersActive"
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={filtersActive}
              onChange={(event) => setFiltersActive(event.currentTarget.checked)}
            />
            {t('crawlers.filtersActive')}
          </label>
        </fieldset>

        {filtersActive && (
          <div className="bg-base-300 space-y-4 rounded-lg p-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Input
                name="includePatterns"
                label={t('crawlers.includePatterns')}
                placeholder="\.pdf$, \.docx?$, \.txt$"
                value={jsonArrayToString(crawler?.includePatterns)}
                schema={crawlerFormSchema}
              />

              <Input
                name="excludePatterns"
                label={t('crawlers.excludePatterns')}
                placeholder="archive, _old, backup, temp"
                value={jsonArrayToString(crawler?.excludePatterns)}
                schema={crawlerFormSchema}
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  name="minFileSize"
                  type="number"
                  label={t('crawlers.minFileSize')}
                  placeholder="0.1"
                  value={crawler?.minFileSize}
                  schema={crawlerFormSchema}
                />

                <Input
                  name="maxFileSize"
                  type="number"
                  label={t('crawlers.maxFileSize')}
                  placeholder="50"
                  value={crawler?.maxFileSize}
                  schema={crawlerFormSchema}
                />
              </div>

              <Input
                name="allowedMimeTypes"
                label={t('crawlers.allowedMimeTypes')}
                placeholder="application/pdf, text/plain, application/msword"
                value={jsonArrayToString(crawler?.allowedMimeTypes)}
                schema={crawlerFormSchema}
              />
            </div>
          </div>
        )}
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
            schema={crawlerFormSchema}
            required
          />
        </div>
      ) : selectedUriType === 'smb' ? (
        <div className="grid grid-cols-2 gap-2">
          <Input
            disabled={selectedUriType !== 'smb'}
            name="username"
            label={t('crawlers.credentialsUsername')}
            placeholder={t('crawlers.placeholders.username')}
            schema={crawlerFormSchema}
            required
          />
          <Input
            disabled={selectedUriType !== 'smb'}
            name="password"
            type="password"
            label={t('crawlers.credentialsPassword')}
            placeholder={t('crawlers.placeholders.password')}
            schema={crawlerFormSchema}
            required
          />
        </div>
      ) : selectedUriType === 'box' ? (
        <div className="grid grid-cols-2 gap-2">
          <Input
            name="boxCustomerId"
            label={t('crawlers.credentialsBoxCustomerId')}
            placeholder={t('crawlers.placeholders.boxCustomerId')}
            schema={crawlerFormSchema}
            required
          />
          <Input
            name="boxToken"
            type="password"
            label={t('crawlers.credentialsBoxToken')}
            placeholder={t('crawlers.placeholders.boxToken')}
            schema={crawlerFormSchema}
            required
          />
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        <fieldset className="fieldset flex">
          <label className="label text-base-content mt-4 font-semibold">
            <input
              name="cronjob.active"
              defaultChecked={scheduleActive}
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
              defaultValue={
                crawler?.cronJob && crawler.cronJob.hour !== undefined && crawler.cronJob.minute !== undefined
                  ? `${crawler.cronJob.hour.toString().padStart(2, '0')}:${crawler.cronJob.minute.toString().padStart(2, '0')}`
                  : '00:00'
              }
              disabled={!scheduleActive}
            />
            {t('crawlers.utcHint')}
          </label>
        </fieldset>
        <div className={twMerge('', !scheduleActive && 'disabled')}>
          <fieldset className="fieldset flex flex-row flex-wrap gap-2">
            <legend className="fieldset-legend">{t('crawlers.days')}</legend>

            <label className="label">
              <input
                name="cronjob.monday"
                type="checkbox"
                className="checkbox checkbox-sm"
                defaultChecked={crawler?.cronJob?.monday ?? true}
                disabled={!scheduleActive}
              />
              {t('labels.monday')}
            </label>

            <label className="label">
              <input
                name="cronjob.tuesday"
                type="checkbox"
                className="checkbox checkbox-sm"
                defaultChecked={crawler?.cronJob?.tuesday ?? true}
                disabled={!scheduleActive}
              />
              {t('labels.tuesday')}
            </label>

            <label className="label">
              <input
                name="cronjob.wednesday"
                type="checkbox"
                className="checkbox checkbox-sm"
                defaultChecked={crawler?.cronJob?.wednesday ?? true}
                disabled={!scheduleActive}
              />
              {t('labels.wednesday')}
            </label>

            <label className="label">
              <input
                name="cronjob.thursday"
                type="checkbox"
                className="checkbox checkbox-sm"
                defaultChecked={crawler?.cronJob?.thursday ?? true}
                disabled={!scheduleActive}
              />
              {t('labels.thursday')}
            </label>

            <label className="label">
              <input
                name="cronjob.friday"
                type="checkbox"
                className="checkbox checkbox-sm"
                defaultChecked={crawler?.cronJob?.friday ?? true}
                disabled={!scheduleActive}
              />
              {t('labels.friday')}
            </label>

            <label className="label">
              <input
                name="cronjob.saturday"
                type="checkbox"
                className="checkbox checkbox-sm"
                defaultChecked={crawler?.cronJob?.saturday ?? true}
                disabled={!scheduleActive}
              />
              {t('labels.saturday')}
            </label>

            <label className="label">
              <input
                name="cronjob.sunday"
                type="checkbox"
                className="checkbox checkbox-sm"
                defaultChecked={crawler?.cronJob?.sunday ?? true}
                disabled={!scheduleActive}
              />
              {t('labels.sunday')}
            </label>
          </fieldset>
        </div>
      </div>
    </div>
  )
}
