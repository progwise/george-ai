import { useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import React, { useRef } from 'react'
import { z } from 'zod'
import { graphql } from '../../gql'
import { AiLibrary } from '../../gql/graphql'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'

const deleteLibraryDocument = graphql(`
  mutation deleteAiLibrary($id: String!) {
    deleteAiLibrary(id: $id) {
      id
    }
  }
`)

const deleteLibrary = createServerFn({ method: 'GET' })
  .validator((data: string) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    return await backendRequest(deleteLibraryDocument, { id: ctx.data })
  })

interface libraryDeleteAssistantDialogProps {
  library: AiLibrary
}

export const LibraryDeleteAssistantDialog = ({
  library,
}: libraryDeleteAssistantDialogProps): React.ReactElement => {
  const deleteDialogRef = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()

  const handleDeleteConfirm = async () => {
    await deleteLibrary({ data: library.id })
    await queryClient.invalidateQueries({ queryKey: [queryKeys.AiLibraries] })
    deleteDialogRef.current?.close()
  }

  const fileCount = library.files?.length
  return (
    <>
      <button
        type="button"
        className="btn btn-error btn-sm"
        onClick={() => deleteDialogRef.current?.showModal()}
      >
        Delete
      </button>
      <dialog ref={deleteDialogRef} className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button
              type="submit"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </button>
          </form>
          <h3 className="text-lg font-bold">Confirm to delete library</h3>
          <p>
            <q>{library.name}</q> will be deleted along with {fileCount} files.
          </p>
          <div className="modal-action">
            <form method="dialog">
              <button
                type="submit"
                className="btn btn-error"
                onClick={handleDeleteConfirm}
              >
                Delete Assistant
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  )
}
