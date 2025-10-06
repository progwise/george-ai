import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useRef } from 'react'

import { graphql } from '../../gql'
import { LibraryDeleteDialog_LibraryFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { TrashIcon } from '../../icons/trash-icon'
import { DialogForm } from '../dialog-form'
import { getLibrariesQueryOptions } from './get-libraries'
import { deleteFilesFn } from './server-functions/delete-files'
import { deleteLibraryFn } from './server-functions/delete-library'

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
      await deleteFilesFn({ data: library.id })
      await deleteLibraryFn({ data: library.id })
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
