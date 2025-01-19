import React, { useRef } from 'react'
import { AiAssistant } from '../gql/graphql'
import { Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/start'
import { BACKEND_GRAPHQL_URL } from '../constants'
import request from 'graphql-request'
import { graphql } from '../gql'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../query-keys'

const deleteAssistantDocument = graphql(`
  mutation deleteAiAssistant($id: String!) {
    deleteAiAssistant(assistantId: $id) {
      id
    }
  }
`)

const deleteAssistant = createServerFn({ method: 'GET' })
  .validator((data: string) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    return await request(BACKEND_GRAPHQL_URL, deleteAssistantDocument, {
      id: ctx.data,
    })
  })

export interface AssistantCardProps {
  assistant: AiAssistant
}

export const AssistantCard = ({
  assistant,
}: AssistantCardProps): React.ReactElement => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const queryClient = useQueryClient()

  const handleDelete = () => {
    console.log('Delete assistant')
    dialogRef.current?.showModal()
  }

  const handleDeleteConfirmed = async () => {
    await deleteAssistant({ data: assistant.id })
    await queryClient.invalidateQueries({ queryKey: [queryKeys.AiAssistants] })
    dialogRef.current?.close()
  }

  return (
    <>
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button
              type="submit"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </button>
          </form>
          <h3 className="text-lg font-bold">Confirm</h3>
          <p className="py-4">Press ESC key or click on ✕ button to close</p>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button
                type="submit"
                className="btn btn-sm btn-danger"
                onClick={handleDeleteConfirmed}
              >
                Delete Assistant {assistant.name}
              </button>
            </form>
          </div>
        </div>
      </dialog>
      <div key={assistant.id} className="card bg-base-100 w-96 shadow-xl">
        <figure className="max-h-24">
          <div className="absolute top-2 right-2 left-2 flex gap-2 justify-between">
            <button
              type="button"
              className="btn btn-sm btn-warning"
              onClick={handleDelete}
            >
              Delete
            </button>
            <button type="button" className="btn btn-sm btn-success">
              Try
            </button>
          </div>
          <img
            src={assistant.icon ?? '/george-portrait.jpg'}
            alt={assistant.name ?? 'Assistant icon'}
          />
        </figure>
        <div className="card-body p-4">
          <h2 className="card-title">{assistant.name}</h2>
          <p>{assistant.description}</p>
          <div className="card-actions justify-end flex-wrap">
            <div className="flex gap-2">
              <div className="badge badge-outline">OpenAI</div>
              <div className="badge badge-outline">Local Only</div>
              <div className="badge badge-outline">Sequential</div>
            </div>
            <Link
              type="button"
              className="btn btn-sm btn-secondary btn-ghost"
              to={`/assistants/$assistantId`}
              params={{ assistantId: assistant.id }}
            >
              Configure
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
