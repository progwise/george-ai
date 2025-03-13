import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useRef } from 'react'
import { z } from 'zod'

import { useAuth } from '../../auth/auth-hook'
import { graphql } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { backendRequest } from '../../server-functions/backend'
import { DialogForm } from '../dialog-form'
import { Input } from '../form/input'

const createNewAssistant = createServerFn({ method: 'POST' })
  .validator(async (data: FormData) => {
    const o = Object.fromEntries(data)

    return z
      .object({
        ownerId: z.string().nonempty(),
        name: z.string().min(1),
      })
      .parse(o)
  })
  .handler(async (ctx) => {
    const data = await ctx.data
    console.log(data)
    return await backendRequest(
      graphql(`
        mutation createAiAssistant($ownerId: String!, $name: String!) {
          createAiAssistant(ownerId: $ownerId, name: $name) {
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

export const AssistantNewDialog = () => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const auth = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

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

  const onSubmit = (data: FormData) => {
    mutate({ data })
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
        <input type="hidden" name="ownerId" value={auth.user?.id} />
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
