import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useRef } from 'react'
import { z } from 'zod'

import { graphql } from '../../gql'
import { LibraryDeleteDialog_LibraryFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { TrashIcon } from '../../icons/trash-icon'
import { backendRequest } from '../../server-functions/backend'
import { DialogForm } from '../dialog-form'
import { getLibrariesQueryOptions } from './get-libraries'

const deleteFilesDocument = graphql(`
  mutation deleteLibraryFiles($libraryId: String!) {
    deleteLibraryFiles(libraryId: $libraryId)
  }
`)

const deleteLibraryDocument = graphql(`
  mutation deleteLibrary($id: String!) {
    deleteLibrary(id: $id)
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

graphql(`
  fragment LibraryDeleteDialog_Library on AiLibrary {
    id
    name
    filesCount
  }
`)
interface LibraryDeleteDialogProps {
  library: LibraryDeleteDialog_LibraryFragment
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
      await queryClient.invalidateQueries(getLibrariesQueryOptions())
      navigate({ to: '/libraries' })

      dialogReference.current?.close()
    },
  })

  const fileCount = library.filesCount ?? 0

  return (
    <section className="m-0 inline-block p-0">
      <button
        type="button"
        className="btn btn-sm tooltip tooltip-left"
        data-tip={t('tooltips.delete')}
        onClick={() => dialogReference.current?.showModal()}
        disabled={isPending}
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
    </section>
  )
}
