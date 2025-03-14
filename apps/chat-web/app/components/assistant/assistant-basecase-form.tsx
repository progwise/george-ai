import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import React from 'react'
import { z } from 'zod'

import { useAuth } from '../../auth/auth-hook'
import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'
import { Input } from '../form/input'

const upsertAiBaseCases = createServerFn({ method: 'POST' })
  .validator(async (data: FormData) => {
    const baseCases = Array.from(data.getAll('baseCasesId')).map((id, index) => ({
      id,
      sequence: data.getAll('baseCasesSequence')[index],
      description: data.getAll('baseCaseDescription')[index],
    }))

    const assistantId = data.get('assistantId')
    return z
      .object({
        assistantId: z.string().nonempty(),
        baseCases: z.array(
          z.object({
            id: z.string().nullish(),
            sequence: z.preprocess(
              (value: string) => (value?.length || 0 < 1 ? null : parseInt(value)),
              z.number().nullish(),
            ),
            description: z.string().nullish(),
          }),
        ),
      })
      .parse({ assistantId, baseCases })
  })
  .handler(async ({ data }) => {
    return await backendRequest(
      graphql(`
        mutation upsertAiBaseCases($assistantId: String!, $baseCases: [AiBaseCaseInputType!]!) {
          upsertAiBaseCases(assistantId: $assistantId, baseCases: $baseCases) {
            id
            sequence
            description
          }
        }
      `),
      await data,
    )
  })

const AssistantBasecaseForm_assistantFragment = graphql(`
  fragment AssistantBasecaseForm_assistantFragment on AiAssistant {
    id
    baseCases {
      id
      sequence
      description
    }
  }
`)

export interface AssistantBaseCaseFormProps {
  assistant: FragmentType<typeof AssistantBasecaseForm_assistantFragment>
}

export const AssistantBasecaseForm = (props: AssistantBaseCaseFormProps) => {
  const auth = useAuth()
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const formRef = React.useRef<HTMLFormElement>(null)
  const newInputRef = React.useRef<HTMLInputElement>(null)
  const assistant = useFragment(AssistantBasecaseForm_assistantFragment, props.assistant)

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FormData) => {
      await upsertAiBaseCases({ data })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: [queryKeys.AiAssistantForEdit, assistant.id, auth.user?.id] })
    },
  })

  const fieldProps = {
    type: 'text' as const,
    name: 'baseCaseDescription',
    placeholder: 'An user can start here.',
    canGrab: true,
    disabled: isPending,
    onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
      if (!formRef.current) return
      if (event.target === newInputRef.current && !event.target.value) {
        formRef.current.reset()
        return
      }
      const formData = new FormData(formRef.current)
      mutate(formData)
      formRef.current.reset()
      newInputRef.current?.focus()
    },
  }
  return (
    <form ref={formRef} className="flex flex-col gap-2">
      <p className="overflow-hidden text-nowrap text-sm text-base-content/50">{t('assistants.initialSituations')}</p>
      <input type="hidden" name="assistantId" value={assistant.id} />
      {assistant.baseCases.map((baseCase) => (
        <div key={baseCase.id}>
          <input type="hidden" name="baseCasesId" value={baseCase.id || ''} />
          <input type="hidden" name="baseCasesSequence" value={baseCase.sequence || 0} />
          <Input value={baseCase.description} {...fieldProps} />
        </div>
      ))}
      <div>
        <input type="hidden" name="baseCasesId" value="" />
        <input type="hidden" name="baseCasesSequence" value="" />
        <Input ref={newInputRef} value="" {...fieldProps} />
      </div>
    </form>
  )
}
