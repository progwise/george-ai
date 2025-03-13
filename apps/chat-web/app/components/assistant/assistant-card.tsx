import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import React, { useRef } from 'react'
import { z } from 'zod'

import { FragmentType, graphql, useFragment } from '../../gql'
import { AiAssistant } from '../../gql/graphql'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'

const deleteAssistant = createServerFn({ method: 'GET' })
  .validator((data: string) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        mutation deleteAiAssistant($id: String!) {
          deleteAiAssistant(assistantId: $id) {
            id
          }
        }
      `),
      {
        id: ctx.data,
      },
    )
  })

const AssistantCard_assistantFragment = graphql(`
  fragment AssistantCard_assistantFragment on AiAssistant {
    id
    name
    description
    icon
  }
`)

export interface AssistantCardProps {
  assistant: FragmentType<typeof AssistantCard_assistantFragment>
}

export const AssistantCard = (props: AssistantCardProps): React.ReactElement => {
  const assistant = useFragment(AssistantCard_assistantFragment, props.assistant)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const queryClient = useQueryClient()

  const handleDelete = () => {
    dialogRef.current?.showModal()
  }

  const handleDeleteConfirm = async () => {
    await deleteAssistant({ data: assistant.id })
    await queryClient.invalidateQueries({ queryKey: [queryKeys.AiAssistants] })
    dialogRef.current?.close()
  }

  return (
    <>
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button type="submit" className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="text-lg font-bold">Confirm to delete assistant</h3>
          <p>
            <q>{assistant.name}</q> will be deleted.
          </p>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button type="submit" className="btn btn-error" onClick={handleDeleteConfirm}>
                Delete Assistant
              </button>
            </form>
          </div>
        </div>
      </dialog>
      <div key={assistant.id} className="card w-96 bg-base-100 shadow-xl">
        <figure className="max-h-24">
          <div className="absolute left-2 right-2 top-2 flex justify-between gap-2">
            <button type="button" className="btn btn-warning btn-sm" onClick={handleDelete}>
              Delete
            </button>
            <button type="button" className="btn btn-success btn-sm">
              Try
            </button>
          </div>
          <img
            src={
              !assistant.icon || assistant.icon?.length < 5000 //change if icon upload implemented
                ? '/george-portrait.jpg'
                : assistant.icon
            }
            alt={assistant.name ?? 'Assistant icon'}
          />
        </figure>
        <div className="card-body p-4">
          <h2 className="card-title">{assistant.name}</h2>
          <p>{assistant.description}</p>
          <div className="card-actions flex-wrap justify-end">
            <div className="flex gap-2">
              <div className="badge badge-outline">OpenAI</div>
              <div className="badge badge-outline">Local Only</div>
              <div className="badge badge-outline">Sequential</div>
            </div>
            <Link
              type="button"
              className="btn btn-ghost btn-secondary btn-sm"
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
