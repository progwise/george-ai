import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { useRef } from 'react'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { AssistantBaseFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { TrashIcon } from '../../../icons/trash-icon'
import { backendRequest } from '../../../server-functions/backend'
import { DialogForm } from '../../dialog-form'
import { getAiAssistantsQueryOptions } from '../get-assistants'

const deleteAssistant = createServerFn({ method: 'POST' })
  .inputValidator(async (data: FormData) => {
    const o = Object.fromEntries(data)

    return z
      .object({
        assistantId: z.string().nonempty(),
      })
      .parse(o)
  })
  .handler(async (ctx) => {
    const data = await ctx.data
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

export interface AssistantDeleteDialogProps {
  assistant: AssistantBaseFragment
}

export const AssistantDeleteDialog = ({ assistant }: AssistantDeleteDialogProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const dialogRef = useRef<HTMLDialogElement>(null)

  const { mutate, isPending } = useMutation({
    mutationFn: deleteAssistant,
    onSettled: (result) => {
      const deletedId = result?.deleteAiAssistant?.id
      if (!deletedId) {
        throw new Error('Failed to delete assistant')
      }
      queryClient.invalidateQueries(getAiAssistantsQueryOptions())
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
        className="tooltip btn tooltip-right btn-ghost btn-sm"
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
