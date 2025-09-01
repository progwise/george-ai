import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useRef } from 'react'
import { z } from 'zod'

import { validateForm } from '@george-ai/web-utils'

import { graphql } from '../../gql'
import { Language, getLanguage, translate } from '../../i18n'
import { useTranslation } from '../../i18n/use-translation-hook'
import { backendRequest } from '../../server-functions/backend'
import { DialogForm } from '../dialog-form'
import { Input } from '../form/input'
import { toastError } from '../georgeToaster'

export const getFormSchema = (language: Language) =>
  z.object({
    name: z.string().min(1, translate('errors.requiredField', language)),
    description: z.string().optional(),
  })

const createNewLibrary = createServerFn({ method: 'POST' })
  .validator(async (data: FormData) => {
    const language = await getLanguage()
    const entries = Object.fromEntries(data)
    return getFormSchema(language).parse(entries)
  })
  .handler(async (ctx) => {
    const data = await ctx.data
    return await backendRequest(
      graphql(`
        mutation createAiLibrary($data: AiLibraryInput!) {
          createAiLibrary(data: $data) {
            id
            name
          }
        }
      `),
      {
        data: {
          name: data.name,
          description: data.description,
        },
      },
    )
  })

export const LibraryNewDialog = () => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { t, language } = useTranslation()
  const navigate = useNavigate()
  const schema = getFormSchema(language)

  const { mutate, isPending } = useMutation({
    mutationFn: createNewLibrary,
    onSettled: (result) => {
      const newId = result?.createAiLibrary?.id
      if (!newId) {
        throw new Error('Failed to create library')
      }
      navigate({ to: `/libraries/${newId}` })
    },
  })

  const showDialog = () => {
    dialogRef.current?.showModal()
  }

  const onSubmit = (form: HTMLFormElement) => {
    const { formData, errors } = validateForm(form, schema)
    if (errors) {
      toastError(errors.map((error) => <div key={error}>{error}</div>))
      return
    }
    mutate({ data: formData })
  }

  return (
    <>
      <button type="button" className="btn btn-primary btn-sm" onClick={showDialog}>
        {t('libraries.addNewButton')}
      </button>
      <DialogForm
        ref={dialogRef}
        title={t('libraries.addNew')}
        description={t('libraries.addNewDescription')}
        onSubmit={onSubmit}
        disabledSubmit={isPending}
      >
        <div className="flex w-full flex-col gap-4">
          <Input
            name="name"
            type="text"
            label={t('labels.name')}
            placeholder={t('libraries.placeholders.name')}
            required
          />
          <Input
            name="description"
            type="textarea"
            label={t('labels.description')}
            placeholder={t('libraries.placeholders.description')}
            className="min-h-32"
          />
        </div>
      </DialogForm>
    </>
  )
}
