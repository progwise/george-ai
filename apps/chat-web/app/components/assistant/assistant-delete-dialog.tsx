import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useRef } from 'react'
import { z } from 'zod'

import { useAuth } from '../../auth/auth-hook'
import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'
import { DialogForm } from '../dialog-form'

const deleteAssistant = createServerFn({ method: 'POST' })
  .validator(async (data: FormData) => {
    const object = Object.fromEntries(data)

    return z
      .object({
        assistantId: z.string().nonempty(),
      })
      .parse(object)
  })
  .handler(async (ctx) => {
    const data = await ctx.data
    console.log(data)
    return await backendRequest(
      graphql(`
        mutation deleteAiAssistant($assistantId: String!) {
          deleteAiAssistant(assistantId: $assistantId) {
            id
            name
          }
        }
      `),
      {
        ...data,
      },
    )
  })

const AssistantDelete_assistantFragment = graphql(`
  fragment AssistantDelete_assistantFragment on AiAssistant {
    id
    name
  }
`)

export interface AssistantDeleteDialogProps {
  assistant: FragmentType<typeof AssistantDelete_assistantFragment>
}

export const AssistantDeleteDialog = (props: AssistantDeleteDialogProps) => {
  const auth = useAuth()
  const queryClient = useQueryClient()
  const assistant = useFragment(AssistantDelete_assistantFragment, props.assistant)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { mutate, isPending } = useMutation({
    mutationFn: deleteAssistant,
    onSettled: (result) => {
      const deletedId = result?.deleteAiAssistant?.id
      if (!deletedId) {
        throw new Error('Failed to delete assistant')
      }
      navigate({ to: `/assistants` })
      queryClient.invalidateQueries({ queryKey: [queryKeys.MyAiAssistants, auth?.user?.id] })
      dialogRef.current?.close()
    },
  })

  const showDialog = () => {
    dialogRef.current?.showModal()
  }

  const onSubmit = (data: FormData) => {
    mutate({ data })
  }

  return (
    <>
      <button type="button" className="btn btn-primary btn-sm" onClick={showDialog}>
        {t('assistants.deleteButton')}
      </button>
      <DialogForm
        ref={dialogRef}
        title={t('assistants.delete')}
        description={t('assistants.deleteDescription', { assistantName: assistant.name })}
        onSubmit={onSubmit}
        disabledSubmit={isPending}
      >
        <input type="hidden" name="assistantId" value={assistant.id} />
      </DialogForm>
    </>
  )
}
