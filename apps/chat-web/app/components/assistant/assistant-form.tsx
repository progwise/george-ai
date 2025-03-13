import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import React from 'react'
import { z } from 'zod'

import { useAuth } from '../../auth/auth-hook'
import { FragmentType, graphql, useFragment } from '../../gql'
import { getLanguage, translate } from '../../i18n'
import { useTranslation } from '../../i18n/use-translation-hook'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'
import { FileUpload } from '../form/file-upload'
import { Input } from '../form/input'
import { Select } from '../form/select'

const AssistantForm_AssistantFragment = graphql(`
  fragment AssistantForm_assistant on AiAssistant {
    id
    name
    description
    ownerId
    languageModelId
    languageModel {
      id
      name
    }
    llmTemperature
    baseCases {
      id
      sequence
      description
    }
  }
`)

const AssistantForm_LanguageModelFragment = graphql(`
  fragment AssistantForm_languageModel on AiLanguageModel {
    id
    name
  }
`)

const getFormSchema = (language: 'en' | 'de') =>
  z.object({
    id: z.string().nonempty(),
    name: z.string().min(1, translate('errors.requiredField', language)),
    description: z.string().nullish(),
    languageModelId: z.string().nullish(),
    llmTemperature: z.preprocess(
      (value: string) => (value?.length < 1 ? null : parseFloat(value)),
      z
        .number()
        .min(0, translate('errors.llmTemperatureToLow', language))
        .max(1, translate('errors.llmTemperatureToHigh', language))
        .nullish(),
    ),
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
          languageModelId: data.languageModelId,
          llmTemperature: data.llmTemperature,
        },
      },
    )
  })

export interface AssistantEditFormProps {
  assistant?: FragmentType<typeof AssistantForm_AssistantFragment>
  languageModels: FragmentType<typeof AssistantForm_LanguageModelFragment>[]
  disabled: boolean
}

export const AssistantForm = (props: AssistantEditFormProps): React.ReactElement => {
  const { user } = useAuth()
  const ownerId = user?.id
  const formRef = React.useRef<HTMLFormElement>(null)
  const { t, language } = useTranslation()
  const queryClient = useQueryClient()
  const assistant = useFragment(AssistantForm_AssistantFragment, props.assistant)
  const languageModels = useFragment(AssistantForm_LanguageModelFragment, props.languageModels)
  const { disabled } = props

  const schema = getFormSchema(language)

  const { mutate: update, isPending: updateIsPending } = useMutation({
    mutationFn: (data: FormData) => updateAssistant({ data }),
    onSettled: (data) =>
      queryClient.invalidateQueries({ queryKey: [queryKeys.AiAssistantForEdit, data?.updateAiAssistant?.id, ownerId] }),
  })

  const fieldProps = {
    schema,
    disabled: updateIsPending || disabled,
    onBlur: () => {
      const formData = new FormData(formRef.current!)
      const object = Object.fromEntries(formData)
      const parseResult = schema.safeParse(object)
      if (parseResult.success) {
        update(formData)
      } else {
        console.error('Validation errors:', parseResult.error.errors)
      }
    },
  }

  return (
    <form ref={formRef} className="flex w-full flex-col items-center gap-2 sm:grid sm:w-auto sm:grid-cols-2">
      <input type="hidden" name="ownerId" value={ownerId} />
      <input type="hidden" name="id" value={assistant?.id} />

      <FileUpload
        className="col-span-2 justify-self-center"
        fileTypes="image/*"
        handleUploadFiles={(event) => console.log(event)}
      />
      <Input
        name="name"
        type="text"
        label={t('labels.name')}
        value={assistant?.name}
        className="col-span-2"
        required
        {...fieldProps}
      />

      <Input
        name="description"
        type="textarea"
        label={t('labels.description')}
        value={assistant?.description}
        placeholder={t('assistants.placeholders.description')}
        className="col-span-2"
        required
        {...fieldProps}
      />

      <Select
        name="languageModelId"
        label={t('labels.languageModel')}
        options={languageModels}
        value={assistant?.languageModel}
        className="col-span-1"
        {...fieldProps}
      />

      <Input
        name="llmTemperature"
        type="number"
        label={t('labels.llmTemperature')}
        value={assistant?.llmTemperature}
        className="col-span-1 flex-grow"
        required
        {...fieldProps}
      />
    </form>
  )
}
