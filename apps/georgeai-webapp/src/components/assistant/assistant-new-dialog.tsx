import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { backendRequest } from '../../server-functions/backend'
import { DialogForm } from '../dialog-form'
import { Input } from '../form/input'

const createNewAssistant = createServerFn({ method: 'POST' })
  .inputValidator(async (data: FormData) => {
    return z
      .object({
        name: z.string().min(1),
      })
      .parse(Object.fromEntries(data))
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

interface AssistantNewDialogProps {
  ref: React.RefObject<HTMLDialogElement | null>
}

export const AssistantNewDialog = ({ ref }: AssistantNewDialogProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { mutate, isPending } = useMutation({
    mutationFn: createNewAssistant,
    onSuccess: (result) => {
      const newId = result?.createAiAssistant?.id
      if (!newId) {
        throw new Error('Failed to create assistant')
      }
      ref.current?.close()
      navigate({ to: `/assistants/${newId}` })
    },
  })

  const onSubmit = (data: FormData) => {
    mutate({ data })
  }

  return (
    <DialogForm
      ref={ref}
      title={t('assistants.addNew')}
      description={t('assistants.addNewDescription')}
      onSubmit={onSubmit}
      disabledSubmit={isPending}
      submitButtonText={t('actions.create')}
    >
      <Input
        name="name"
        type="text"
        label={t('assistants.labelName')}
        placeholder={t('assistants.placeholders.name')}
        required
      />
    </DialogForm>
  )
}
