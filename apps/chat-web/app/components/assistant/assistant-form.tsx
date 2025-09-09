import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import React, { useMemo } from 'react'
import { z } from 'zod'

import { graphql } from '../../gql'
import { AssistantForm_AssistantFragment } from '../../gql/graphql'
import { Language, getLanguage, translate } from '../../i18n'
import { useTranslation } from '../../i18n/use-translation-hook'
import { backendRequest, getBackendPublicUrl } from '../../server-functions/backend'
import { IconUpload } from '../form/icon-upload'
import { Input } from '../form/input'
import { Select } from '../form/select'
import { getChatModelsQueryOptions } from '../model/get-models'
import { getAssistantQueryOptions } from './get-assistant'

graphql(`
  fragment AssistantForm_Assistant on AiAssistant {
    id
    name
    iconUrl
    description
    ownerId
    languageModel
    updatedAt
  }
`)

const getFormSchema = (language: Language) =>
  z.object({
    id: z.string().nonempty(),
    name: z.string().min(1, translate('errors.requiredField', language)),
    description: z.string().nullish(),
    languageModel: z.string().nullish(),
  })

const updateAssistant = createServerFn({ method: 'POST' })
  .validator(async (data: FormData) => {
    const o = Object.fromEntries(data)
    const language = await getLanguage()
    const schema = getFormSchema(language)
    return schema.parse(o)
  })
  .handler(async (ctx) => {
    const data = await ctx.data
    return await backendRequest(
      graphql(`
        mutation updateAssistant($id: String!, $data: AiAssistantInput!) {
          updateAiAssistant(id: $id, data: $data) {
            id
          }
        }
      `),
      {
        id: data.id,
        data: {
          name: data.name,
          description: data.description,
          languageModel: data.languageModel,
        },
      },
    )
  })

export interface AssistantEditFormProps {
  assistant: AssistantForm_AssistantFragment
  disabled: boolean
}

export const AssistantForm = ({ assistant, disabled }: AssistantEditFormProps): React.ReactElement => {
  const formRef = React.useRef<HTMLFormElement>(null)
  const { t, language } = useTranslation()
  const queryClient = useQueryClient()

  const schema = React.useMemo(() => getFormSchema(language), [language])

  const { data: fetchedModelData } = useSuspenseQuery(getChatModelsQueryOptions())

  const { mutate: update } = useMutation({
    mutationFn: (data: FormData) => updateAssistant({ data }),
    onSettled: () => queryClient.invalidateQueries(getAssistantQueryOptions(assistant.id)),
  })

  const { mutate: mutateAssistantIcon } = useMutation({
    mutationFn: async (file: File) => {
      const fileExtension = file.name.split('.').pop() || 'png'
      const uploadUrl = (await getBackendPublicUrl()) + `/assistant-icon?assistantId=${assistant.id}`
      await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'image/*',
          'x-file-extension': fileExtension.toLowerCase(),
        },
        body: file,
      })
    },
    onSettled: () => queryClient.invalidateQueries(getAssistantQueryOptions(assistant.id)),
  })

  const handleUploadIcon = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.currentTarget.files
      if (!files || files.length !== 1) return
      const file = Array.from(files)[0]
      mutateAssistantIcon(file)
    },
    [mutateAssistantIcon],
  )

  const fieldProps = {
    schema,
    disabled,
    onBlur: () => {
      const formData = new FormData(formRef.current!)
      const parseResult = schema.safeParse(Object.fromEntries(formData))
      if (parseResult.success) {
        update(formData)
      } else {
        console.error('Validation errors:', parseResult.error.errors)
      }
    },
  }

  const aiModels = useMemo(
    () => fetchedModelData.aiChatModels.map((model) => ({ id: model, name: model })),
    [fetchedModelData],
  )

  return (
    <form ref={formRef} className="grid items-center gap-2" onSubmit={(e) => e.preventDefault()}>
      <input type="hidden" name="id" value={assistant.id} />

      <IconUpload
        key={`assistant-icon-${assistant.id}-${assistant.updatedAt}`}
        className="col-span-2 justify-self-center"
        fileTypes="image/*"
        handleUploadIcon={handleUploadIcon}
        imageUrl={assistant.iconUrl}
      />
      <Input
        name="name"
        type="text"
        label={t('labels.name')}
        value={assistant.name}
        className="col-span-2"
        required
        {...fieldProps}
      />

      <Input
        name="description"
        type="textarea"
        label={t('labels.description')}
        value={assistant.description}
        placeholder={t('assistants.placeholders.description')}
        className="col-span-2 min-h-40"
        required
        {...fieldProps}
      />

      <Select
        name="languageModel"
        label={t('labels.languageModel')}
        options={aiModels}
        value={aiModels.find((model) => model.id === assistant.languageModel)}
        className="col-span-1"
        placeholder={t('assistants.placeholders.languageModel')}
        {...fieldProps}
      />
    </form>
  )
}
