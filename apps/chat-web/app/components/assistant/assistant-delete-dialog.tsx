import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useRef } from 'react'
import { z } from 'zod'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { TrashIcon } from '../../icons/trash-icon'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'
import { DialogForm } from '../dialog-form'

const deleteAssistant = createServerFn({ method: 'POST' })
  .validator(async (data: FormData) => {
    const o = Object.fromEntries(data)

    return z
      .object({
        assistantId: z.string().nonempty(),
      })
      .parse(o)
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

const AssistantDelete_AssistantFragment = graphql(`
  fragment AssistantDelete_Assistant on AiAssistant {
    id
    name
  }
`)

export interface AssistantDeleteDialogProps {
  assistant: FragmentType<typeof AssistantDelete_AssistantFragment>
  userId: string
}

export const AssistantDeleteDialog = (props: AssistantDeleteDialogProps) => {
  const queryClient = useQueryClient()
  const assistant = useFragment(AssistantDelete_AssistantFragment, props.assistant)
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
      queryClient.invalidateQueries({ queryKey: [queryKeys.MyAiAssistants, props.userId] })
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
      <button
        type="button"
        className="btn btn-ghost btn-sm tooltip"
        onClick={showDialog}
        data-tip={t('assistants.delete')}
      >
        <TrashIcon />
      </button>

      <DialogForm
        ref={dialogRef}
        title={t('assistants.delete')}
        description={t('assistants.deleteDescription').replace('{assistant.name}', assistant.name)}
        onSubmit={onSubmit}
        disabledSubmit={isPending}
      >
        <input type="hidden" name="assistantId" value={assistant.id} />
      </DialogForm>
    </>
  )
}
