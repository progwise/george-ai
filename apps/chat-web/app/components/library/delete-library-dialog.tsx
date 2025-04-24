import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useRef } from 'react'
import { z } from 'zod'

import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { TrashIcon } from '../../icons/trash-icon'
import { backendRequest } from '../../server-functions/backend'
import { getLibrariesQueryOptions } from './get-libraries-query-options'

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

const DeleteLibraryDialog_LibraryFragment = graphql(`
  fragment DeleteLibraryDialog_Library on AiLibrary {
    id
    name
    ownerId
    filesCount
    createdAt
    description
    url
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

interface LibraryDeleteAssistantDialogProps {
  library: FragmentType<typeof DeleteLibraryDialog_LibraryFragment>
}

export const DeleteLibraryDialog = (props: LibraryDeleteAssistantDialogProps) => {
  const dialogReference = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const library = useFragment(DeleteLibraryDialog_LibraryFragment, props.library)

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

  const handleDeleteConfirm = () => {
    deleteLibraryWithFiles()
  }

  const fileCount = library.filesCount ?? 0

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-sm lg:tooltip"
        data-tip={t('tooltips.deleteLibrary')}
        onClick={() => dialogReference.current?.showModal()}
      >
        <TrashIcon className="size-6" />
      </button>
      <dialog ref={dialogReference} className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">{t('libraries.deleteLibrary', { libraryName: library.name })}</h3>
          <p className="py-4">{t('libraries.deleteLibraryConfirmation', { libraryName: library.name, fileCount })}</p>
          <div className="modal-action">
            <form method="dialog">
              <button type="submit" className="btn btn-sm">
                {t('actions.cancel')}
              </button>
            </form>
            <button type="submit" className="btn btn-error btn-sm" disabled={isPending} onClick={handleDeleteConfirm}>
              {t('actions.delete')}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="submit">cancel</button>
        </form>
      </dialog>
    </>
  )
}
