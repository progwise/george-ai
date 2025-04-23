import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useRef } from 'react'
import { z } from 'zod'

import { graphql } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { backendRequest } from '../../server-functions/backend'
import { DialogForm } from '../dialog-form'
import { Input } from '../form/input'

const createNewLibrary = createServerFn({ method: 'POST' })
  .validator(async (data: FormData) => {
    return z
      .object({
        ownerId: z.string().nonempty(),
        name: z.string().min(1),
        description: z.string().optional(),
      })
      .parse(Object.fromEntries(data))
  })
  .handler(async (ctx) => {
    const data = await ctx.data
    return await backendRequest(
      graphql(`
        mutation createAiLibrary($ownerId: String!, $data: AiLibraryInput!) {
          createAiLibrary(ownerId: $ownerId, data: $data) {
            id
            name
          }
        }
      `),
      {
        ownerId: data.ownerId,
        data: {
          name: data.name,
          description: data.description,
        },
      },
    )
  })

interface LibraryNewDialogProps {
  userId?: string
}

export const LibraryNewDialog = ({ userId }: LibraryNewDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { mutate, isPending } = useMutation({
    mutationFn: createNewLibrary,
    onSettled: (result) => {
      const newId = result?.createAiLibrary?.id
      if (!newId) {
        throw new Error('Failed to create library')
      }
      navigate({ to: `/libraries/${newId}` })
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
        {t('libraries.addNewButton')}
      </button>
      <DialogForm
        ref={dialogRef}
        title={t('libraries.addNew')}
        description={t('libraries.addNewDescription')}
        onSubmit={onSubmit}
        disabledSubmit={isPending}
      >
        <input type="hidden" name="ownerId" value={userId} />
        <div className="flex w-full flex-col gap-4">
          <Input
            name="name"
            type="text"
            label={t('labels.name')}
            placeholder={t('libraries.placeholders.name')}
            required
          />
          <Input
            name="description"
            type="textarea"
            label={t('labels.description')}
            placeholder={t('libraries.placeholders.description')}
            className="min-h-32"
          />
        </div>
      </DialogForm>
    </>
  )
}
