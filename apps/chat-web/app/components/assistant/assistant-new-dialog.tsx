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
  })

const createNewAssistant = createServerFn({ method: 'POST' })
  .validator(async (data: FormData) => {
    const language = await getLanguage()
    const entries = Object.fromEntries(data)
    return getFormSchema(language).parse(entries)
  })
  .handler(async (ctx) => {
    const data = await ctx.data
    return await backendRequest(
      graphql(`
        mutation createAiAssistant($name: String!) {
          createAiAssistant(name: $name) {
            id
            name
          }
        }
      `),
      {
        name: data.name,
      },
    )
  })

export const AssistantNewDialog = () => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { t, language } = useTranslation()
  const navigate = useNavigate()
  const schema = getFormSchema(language)

  const { mutate, isPending } = useMutation({
    mutationFn: createNewAssistant,
    onSettled: (result) => {
      const newId = result?.createAiAssistant?.id
      if (!newId) {
        throw new Error('Failed to create assistant')
      }
      navigate({ to: `/assistants/${newId}` })
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
        {t('assistants.addNewButton')}
      </button>
      <DialogForm
        ref={dialogRef}
        title={t('assistants.addNew')}
        description={t('assistants.addNewDescription')}
        onSubmit={onSubmit}
        disabledSubmit={isPending}
      >
        <Input
          name="name"
          type="text"
          label={t('labels.name')}
          placeholder={t('assistants.placeholders.name')}
          required
        />
      </DialogForm>
    </>
  )
}
