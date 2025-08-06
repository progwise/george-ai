import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import React, { useMemo, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { HTTP_URI_PATTERN, SHAREPOINT_URI_PATTERN, SMB_URI_PATTERN, formatTime } from '@george-ai/web-utils'

import { DialogForm } from '../../../../../../components/dialog-form'
import { Input } from '../../../../../../components/form/input'
import { toastError, toastSuccess } from '../../../../../../components/georgeToaster'
import {
  getCrawlerCredentialsSchema,
  getCrawlerFormBaseSchema,
} from '../../../../../../components/library/crawler/crawler-form'
import { getCrawlerQueryOptions } from '../../../../../../components/library/crawler/get-crawler'
import { getCrawlersQueryOptions } from '../../../../../../components/library/crawler/get-crawlers'
import { updateCrawlerFunction } from '../../../../../../components/library/crawler/update-crawler'
import { translate } from '../../../../../../i18n'
import { useTranslation } from '../../../../../../i18n/use-translation-hook'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/crawlers/$crawlerId/')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(getCrawlerQueryOptions(params))
  },
})

function RouteComponent() {
  const { t, language } = useTranslation()
  const params = Route.useParams()
  const { queryClient } = Route.useRouteContext()
  const formCredentialsRef = useRef<HTMLDialogElement>(null)
  const formCrawlerRef = useRef<HTMLFormElement>(null)

  const {
    data: { aiLibraryCrawler: crawler },
  } = useSuspenseQuery(getCrawlerQueryOptions(params))
  const { mutate: updateCrawlerMutation, isPending } = useMutation({
    mutationFn: updateCrawlerFunction,
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
  const [selectedUriType, setSelectedUriType] = useState<'http' | 'smb' | 'sharepoint'>(crawler.uriType)
  const [crawlerActive, setCrawlerActive] = useState(!!crawler.cronJob?.active)

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const uriType = formData.get('uriType') as string

    // If SMB or SharePoint type, prompt for credentials
    if (uriType === 'smb' || uriType === 'sharepoint') {
      formCredentialsRef.current?.showModal()
      return
    }
    updateCrawlerMutation({ data: formData })
  }

  const handleCredentialsDialogSubmit = (formDataCredentials: FormData) => {
    if (!formCrawlerRef.current) {
      console.error('Form Crawler Ref not set')
      return
    }
    const username = formDataCredentials.get('username')
    const password = formDataCredentials.get('password')
    const sharepointAuth = formDataCredentials.get('sharepointAuth')
    const formDataCrawler = new FormData(formCrawlerRef.current)

    // Add credentials based on URI type
    if (username) formDataCrawler.append('username', username.toString())
    if (password) formDataCrawler.append('password', password.toString())
    if (sharepointAuth) formDataCrawler.append('sharepointAuth', sharepointAuth.toString())

    updateCrawlerMutation({ data: formDataCrawler })
    formCredentialsRef.current?.close()
  }

  return (
    <>
      <form ref={formCrawlerRef} onSubmit={handleSubmit} className="flex flex-1 flex-col">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Left Column - URL and Crawl Settings */}
          <div className="space-y-4">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="card-title mb-4 text-lg">{t('crawlers.crawlSettings')}</h3>

                <div className="flex justify-end gap-4">
                  <label className="flex gap-2 text-xs">
                    <input
                      type="radio"
                      name="uriType"
                      value="http"
                      className="radio radio-xs"
                      onChange={() => setSelectedUriType('http')}
                      required
                      checked={selectedUriType === 'http'}
                    />
                    <span>{t('crawlers.uriTypeHtml')}</span>
                  </label>
                  <label className="flex gap-2 text-xs">
                    <input
                      type="radio"
                      name="uriType"
                      value="smb"
                      className="radio radio-xs"
                      onChange={() => setSelectedUriType('smb')}
                      checked={selectedUriType === 'smb'}
                    />
                    <span>{t('crawlers.uriTypeSmb')}</span>
                  </label>
                  <label className="flex gap-2 text-xs">
                    <input
                      type="radio"
                      name="uriType"
                      value="sharepoint"
                      className="radio radio-xs"
                      onChange={() => setSelectedUriType('sharepoint')}
                      checked={selectedUriType === 'sharepoint'}
                    />
                    <span>{t('crawlers.uriTypeSharepoint')}</span>
                  </label>
                </div>

                <Input
                  name="uri"
                  value={crawler.uri ?? 'https://'}
                  label={t('crawlers.uri')}
                  schema={crawlerFormSchema}
                  disabled={isPending}
                  className="mb-4"
                  validateOnSchemaChange={true}
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
                <div className="flex flex-row gap-4 align-middle">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input type="hidden" name="cronjob.active" value={crawlerActive ? 'true' : 'false'} />
                    <input
                      defaultChecked={!!crawler.cronJob?.active}
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-primary"
                      onChange={(event) => setCrawlerActive(event.currentTarget.checked)}
                    />
                    <span className="label-text font-medium">{t('crawlers.cronJobActive')}</span>
                  </label>
                  <label className="label">
                    <span className="label-text font-medium">{t('crawlers.cronJobTime')}</span>

                    <input
                      type="time"
                      name="cronjob.time"
                      className="input input-bordered pr-10"
                      required={crawlerActive}
                      disabled={!crawlerActive}
                      defaultValue={
                        crawler?.cronJob ? formatTime(crawler.cronJob.hour, crawler.cronJob.minute) : '00:00'
                      }
                    />
                    <span className="label-text-alt">{t('crawlers.utcHint')}</span>
                  </label>
                </div>

                <div className={twMerge('space-y-4', !crawlerActive && 'pointer-events-none opacity-50')}>
                  <div className="flex flex-col gap-2">
                    <label className="label">
                      <span className="label-text font-medium">{t('crawlers.days')}</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                        <label key={day} className="label cursor-pointer justify-start gap-2 p-0">
                          <input
                            name={`cronjob.${day}`}
                            type="checkbox"
                            className="checkbox checkbox-xs checkbox-primary"
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
      <DialogForm
        ref={formCredentialsRef}
        title={t('crawlers.credentialsDialogTitle')}
        onSubmit={handleCredentialsDialogSubmit}
      >
        {selectedUriType === 'sharepoint' ? (
          <div className="flex flex-col gap-2">
            <div className="alert alert-info">
              <div className="text-sm">
                <strong>Authentication Required:</strong>
                <ol className="mt-2 list-inside list-decimal space-y-1">
                  <li>Open SharePoint site in your browser and log in</li>
                  <li>Open Developer Tools (F12) → Network tab</li>
                  <li>Refresh the page</li>
                  <li>Find any request to the SharePoint site</li>
                  <li>Copy the 'Cookie' header value</li>
                  <li>Paste it in the field below</li>
                </ol>
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
          <>
            <Input
              name="username"
              label={t('crawlers.credentialsUsername')}
              placeholder={t('crawlers.placeholders.username')}
              schema={credentialsSchema}
              required
            />
            <Input
              name="password"
              type="password"
              label={t('crawlers.credentialsPassword')}
              placeholder={t('crawlers.placeholders.password')}
              schema={credentialsSchema}
              required
            />
          </>
        )}
      </DialogForm>
    </>
  )
}
