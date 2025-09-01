import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'
import { z } from 'zod'

import { validateForm } from '@george-ai/web-utils'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { DialogForm } from '../../dialog-form'
import { toastError, toastSuccess } from '../../georgeToaster'
import { addCrawler } from './add-crawler'
import { CrawlerForm, getCrawlerFormSchema } from './crawler-form'
import { getCrawlersQueryOptions } from './get-crawlers'

interface AddCrawlerButtonProps {
  libraryId: string
}

export const AddCrawlerButton = ({ libraryId }: AddCrawlerButtonProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()
  const { t, language } = useTranslation()

  const addCrawlerMutation = useMutation({
    mutationFn: addCrawler,
    onError: (error) => {
      toastError(`${t('crawlers.toastCreateError')}: ${error.message}`)
    },
    onSuccess: async () => {
      toastSuccess(t('crawlers.toastCreateSuccess'))
      await queryClient.invalidateQueries(getCrawlersQueryOptions(libraryId))
      dialogRef.current?.close()
    },
  })
  const isPending = addCrawlerMutation.isPending

  const handleSubmit = (form: HTMLFormElement) => {
    const data = new FormData(form)
    const uriType = z.union([z.literal('http'), z.literal('smb'), z.literal('sharepoint')]).parse(data.get('uriType'))
    const schema = getCrawlerFormSchema('add', uriType, language)
    const { formData, errors } = validateForm(form, schema)
    if (errors) {
      toastError(errors.map((error) => <div key={error}>{error}</div>))
      return
    }
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
        <div className="mt-4">
          <CrawlerForm libraryId={libraryId} />
        </div>
      </DialogForm>
    </>
  )
}
