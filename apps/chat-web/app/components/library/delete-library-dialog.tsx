import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useRef } from 'react'
import { z } from 'zod'

import { graphql } from '../../gql'
import { AiLibrary } from '../../gql/graphql'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'

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

interface libraryDeleteAssistantDialogProps {
  library: AiLibrary
}

export const DeleteLibraryDialog = ({ library }: libraryDeleteAssistantDialogProps) => {
  const deleteDialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const handleDeleteConfirm = async () => {
    await deleteFiles({ data: library.id })
    await deleteLibrary({ data: library.id })
    await queryClient.invalidateQueries({ queryKey: [queryKeys.AiLibraries] })
    navigate({ to: '..' })
    deleteDialogRef.current?.close()
  }

  const fileCount = library.files?.length
  return (
    <>
      <button type="button" className="btn btn-error btn-sm" onClick={() => deleteDialogRef.current?.showModal()}>
        Delete
      </button>
      <dialog ref={deleteDialogRef} className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Delete {library.name} library</h3>
          <p className="py-4">
            {library.name} will be deleted along with {fileCount} files.
          </p>
          <div className="modal-action">
            <form method="dialog">
              <button type="submit" className="btn btn-sm">
                Cancel
              </button>
            </form>
            <button type="submit" className="btn btn-error btn-sm" onClick={handleDeleteConfirm}>
              Delete
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
