import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import React from 'react'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { useAuth } from '../../auth/auth-hook'
import { FragmentType, graphql, useFragment } from '../../gql'
import { getLanguage, translate } from '../../i18n'
import { useTranslation } from '../../i18n/use-translation-hook'
import { queryKeys } from '../../query-keys'
import { backendRequest, getBackendPublicUrl } from '../../server-functions/backend'
import { FileUpload } from '../form/file-upload'
import { Input } from '../form/input'
import { Select } from '../form/select'
import { LoadingSpinner } from '../loading-spinner'

const AssistantForm_AssistantFragment = graphql(`
  fragment AssistantForm_assistant on AiAssistant {
    id
    name
    iconUrl
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

  const schema = React.useMemo(() => getFormSchema(language), [language])

  const { mutate: update, isPending: updateIsPending } = useMutation({
    mutationFn: (data: FormData) => updateAssistant({ data }),
    onSettled: (data) =>
      queryClient.invalidateQueries({ queryKey: [queryKeys.AiAssistantForEdit, data?.updateAiAssistant?.id, ownerId] }),
  })

  const { mutate: mutateAssistantIcon, isPending: mutateAssistantIconPending } = useMutation({
    mutationFn: async (file: File) => {
      if (!assistant?.id || !ownerId) {
        throw new Error('Assistant or ownerId is missing')
      }
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
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: [queryKeys.AiAssistantForEdit, assistant?.id, ownerId],
      }),
  })

  const handleUploadFiles = React.useCallback(
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
    disabled: updateIsPending || mutateAssistantIconPending || disabled,
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

  return (
    <form
      ref={formRef}
      className={twMerge('flex w-full flex-col items-center gap-2')}
      onSubmit={(e) => e.preventDefault()}
    >
      <LoadingSpinner isLoading={updateIsPending || mutateAssistantIconPending} />
      <input type="hidden" name="ownerId" value={ownerId} />
      <input type="hidden" name="id" value={assistant?.id} />

      <FileUpload
        className="z-10 col-span-2 justify-self-center"
        fileTypes="image/*"
        handleUploadFiles={handleUploadFiles}
        imageUrl={assistant?.iconUrl}
      />
      <Input
        name="name"
        type="text"
        label={t('labels.name')}
        value={assistant?.name}
        className="z-10 col-span-2"
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
        placeholder={t('assistants.placeholders.languageModel')}
        {...fieldProps}
      />

      <Input
        name="llmTemperature"
        type="number"
        label={t('labels.llmTemperature')}
        value={assistant?.llmTemperature}
        className="col-span-1 flex-grow"
        placeholder={t('assistants.placeholders.llmTemperature')}
        required
        {...fieldProps}
      />
    </form>
  )
}
