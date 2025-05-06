import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { useRef } from 'react'

import { graphql } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { backendRequest } from '../../../server-functions/backend'
import { DialogForm } from '../../dialog-form'
import { crawlerFormSchema, getCrawlerFormData } from './crawler-form'
import { getCrawlersQueryOptions } from './get-crawlers'

const addCrawlerFunction = createServerFn({ method: 'POST' })
  .validator((data: FormData) => {
    return crawlerFormSchema.parse(getCrawlerFormData(data))
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
      <button className="btn btn-primary btn-xs" type="button" onClick={() => dialogRef.current?.showModal()}>
        {t('crawlers.addNew')}
      </button>

      <DialogForm
        ref={dialogRef}
        title={t('crawlers.addNew')}
        onSubmit={handleSubmit}
        disabledSubmit={isPending}
        submitButtonText={t('actions.create')}
      >
        <div className="w-full">
          <Input
            name="url"
            placeholder="https://"
            label={t('crawlers.url')}
            schema={createCrawlerFormSchema}
            disabled={isPending}
          />
          <Input
            name="maxDepth"
            type="number"
            value={2}
            label={t('crawlers.maxDepth')}
            schema={createCrawlerFormSchema}
            disabled={isPending}
          />
          <Input
            name="maxPages"
            type="number"
            value={10}
            label={t('crawlers.maxPages')}
            schema={createCrawlerFormSchema}
            disabled={isPending}
          />

          <hr />

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

          <div className={twMerge('contents', !crawlerActive && 'hidden')}>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">{t('crawlers.cronJobTime')}</legend>
              <input
                type="time"
                name="cronjob.time"
                className="input w-full"
                required={crawlerActive}
                defaultValue="00:00"
              />
              <p className="label">{t('crawlers.utcHint')}</p>
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">{t('crawlers.days')}</legend>

              <label className="label">
                <input name="cronjob.monday" type="checkbox" className="checkbox checkbox-sm" defaultChecked />
                {t('labels.monday')}
              </label>

              <label className="label">
                <input name="cronjob.tuesday" type="checkbox" className="checkbox checkbox-sm" defaultChecked />
                {t('labels.tuesday')}
              </label>

              <label className="label">
                <input name="cronjob.wednesday" type="checkbox" className="checkbox checkbox-sm" defaultChecked />
                {t('labels.wednesday')}
              </label>

              <label className="label">
                <input name="cronjob.thursday" type="checkbox" className="checkbox checkbox-sm" defaultChecked />
                {t('labels.thursday')}
              </label>

              <label className="label">
                <input name="cronjob.friday" type="checkbox" className="checkbox checkbox-sm" defaultChecked />
                {t('labels.friday')}
              </label>

              <label className="label">
                <input name="cronjob.saturday" type="checkbox" className="checkbox checkbox-sm" defaultChecked />
                {t('labels.saturday')}
              </label>

              <label className="label">
                <input name="cronjob.sunday" type="checkbox" className="checkbox checkbox-sm" defaultChecked />
                {t('labels.sunday')}
              </label>
            </fieldset>
          </div>

          <input type="hidden" name="libraryId" value={libraryId} />
        </div>
      </DialogForm>
    </>
  )
}
