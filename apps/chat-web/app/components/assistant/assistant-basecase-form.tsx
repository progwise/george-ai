import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import React, { useEffect } from 'react'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { graphql } from '../../gql'
import { AssistantBasecaseForm_AssistantFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { getAssistantQueryOptions } from '../../server-functions/assistant'
import { backendRequest } from '../../server-functions/backend'
import { Input } from '../form/input'

const upsertAiBaseCases = createServerFn({ method: 'POST' })
  .validator(async (data: FormData) => {
    const baseCases = Array.from(data.getAll('baseCasesId')).map((id, index) => ({
      id,
      sequence: data.getAll('baseCasesSequence')[index],
      condition: data.getAll('baseCasesCondition')[index],
      instruction: data.getAll('baseCasesInstruction')[index],
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
            condition: z.string().nullish(),
            instruction: z.string().nullish(),
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
            condition
            instruction
          }
        }
      `),
      await data,
    )
  })

graphql(`
  fragment AssistantBasecaseForm_Assistant on AiAssistant {
    id
    baseCases {
      id
      sequence
      condition
      instruction
    }
  }
`)

export interface AssistantBaseCaseFormProps {
  assistant: AssistantBasecaseForm_AssistantFragment
  userId: string
}

export const AssistantBasecaseForm = ({ assistant, userId }: AssistantBaseCaseFormProps) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const formRef = React.useRef<HTMLFormElement>(null)

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FormData) => {
      return await upsertAiBaseCases({ data })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getAssistantQueryOptions(assistant.id, userId))
    },
  })

  useEffect(() => {
    // Repair the focus and set it to the last existing instruction input if baseCase length changed
    if (formRef.current) {
      const instructionInputs = formRef.current.querySelectorAll<HTMLTextAreaElement>(
        'textarea[name="baseCasesInstruction"]',
      )
      if (instructionInputs && instructionInputs.length > 1) {
        instructionInputs[instructionInputs.length - 2].focus()
      }
    }
  }, [assistant.baseCases.length])

  const fieldProps = {
    canGrab: true,
    disabled: isPending,
    className: 'w-full',
    onBlur: (event: React.FocusEvent) => {
      event.preventDefault()
      if (!formRef.current) return

      const formData = new FormData(formRef.current)
      mutate(formData)
      formRef.current.reset()
    },
  }
  return (
    <form ref={formRef} className="flex flex-col gap-2">
      <p className="text-base-content/50">{t('labels.behavior')}</p>
      <input type="hidden" name="assistantId" value={assistant.id} />
      {assistant.baseCases.map((baseCase, index) => (
        <div key={baseCase.id} className="border-base-content/20 flex flex-col gap-2 border-b pb-2">
          <input type="hidden" name="baseCasesId" value={baseCase.id || ''} />
          <input type="hidden" name="baseCasesSequence" value={baseCase.sequence || 0} />
          <Input
            label={`${index + 1}. ${t('labels.condition')}`}
            value={baseCase.condition}
            name="baseCasesCondition"
            placeholder={t('placeholders.condition')}
            {...fieldProps}
          />
          <Input
            label={`${t('labels.instructions')}`}
            type="textarea"
            value={baseCase.instruction}
            name="baseCasesInstruction"
            placeholder={t('placeholders.instruction')}
            {...{ ...fieldProps, className: twMerge(fieldProps.className, 'h-24') }}
          />
        </div>
      ))}
      <div className="flex flex-col gap-2">
        <input type="hidden" name="baseCasesId" value="" />
        <input type="hidden" name="baseCasesSequence" value="" />
        <Input
          label={`${t('labels.nextCondition')}`}
          value=""
          name="baseCasesCondition"
          placeholder={t('placeholders.condition')}
          {...fieldProps}
        />
        <Input
          label={`${t('labels.instructions')}`}
          type="textarea"
          value=""
          name="baseCasesInstruction"
          placeholder={t('placeholders.instruction')}
          {...{ ...fieldProps, className: twMerge(fieldProps.className, 'h-24') }}
        />
      </div>
    </form>
  )
}
