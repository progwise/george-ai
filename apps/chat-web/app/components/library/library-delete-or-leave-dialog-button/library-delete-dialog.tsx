import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useRef } from 'react'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { AiLibraryDetailFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { TrashIcon } from '../../../icons/trash-icon'
import { backendRequest } from '../../../server-functions/backend'
import { DialogForm } from '../../dialog-form'
import { getLibrariesQueryOptions } from './../get-libraries-query-options'

const deleteFilesDocument = graphql(`
  mutation dropFiles($libraryId: String!) {
    dropFiles(libraryId: $libraryId) {
      id
      libraryId
    }
  }
`)

const deleteLibraryDocument = graphql(`
  mutation deleteAiLibrary($id: String!) {
    deleteAiLibrary(id: $id) {
      id
    }
  }
`)

const deleteFiles = createServerFn({ method: 'POST' })
  .validator((data: string) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    return await backendRequest(deleteFilesDocument, { libraryId: ctx.data })
  })

const deleteLibrary = createServerFn({ method: 'GET' })
  .validator((data: string) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    return await backendRequest(deleteLibraryDocument, { id: ctx.data })
  })

interface LibraryDeleteDialogProps {
  library: AiLibraryDetailFragment
}

export const LibraryDeleteDialog = ({ library }: LibraryDeleteDialogProps) => {
  const dialogReference = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { mutate: deleteLibraryWithFiles, isPending } = useMutation({
    mutationFn: async () => {
      await deleteFiles({ data: library.id })
      await deleteLibrary({ data: library.id })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getLibrariesQueryOptions(library.ownerId))
      navigate({ to: '..' })

      dialogReference.current?.close()
    },
  })

  const fileCount = library.filesCount ?? 0

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-sm lg:tooltip lg:tooltip-bottom"
        data-tip={t('tooltips.delete')}
        onClick={() => dialogReference.current?.showModal()}
      >
        <TrashIcon className="size-6" />
      </button>

      <DialogForm
        ref={dialogReference}
        title={t('libraries.deleteLibrary', { libraryName: library.name })}
        description={t('libraries.deleteLibraryConfirmation', { libraryName: library.name, fileCount })}
        onSubmit={() => {
          deleteLibraryWithFiles()
        }}
        submitButtonText={t('actions.delete')}
        disabledSubmit={isPending}
      />
    </>
  )
}
