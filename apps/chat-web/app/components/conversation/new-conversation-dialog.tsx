import { RefObject } from 'react'
import { AiAssistant, User } from '../../gql/graphql'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createConversation,
  myConversationsQueryOptions,
} from '../../server-functions/conversations'
import { LoadingSpinner } from '../loading-spinner'
import { useNavigate } from '@tanstack/react-router'

interface NewConversationDialogProps {
  userId: string
  assistants: AiAssistant[]
  users: User[]
  ref: RefObject<HTMLDialogElement | null>
}

export const NewConversationDialog = ({
  userId,
  assistants,
  users,
  ref,
}: NewConversationDialogProps) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      assistantIds,
      userIds,
    }: {
      assistantIds: string[]
      userIds: string[]
    }) => {
      return await createConversation({
        data: {
          userIds: [...userIds, userId],
          assistantIds: [...assistantIds],
        },
      })
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries(myConversationsQueryOptions(userId))
      ref.current?.close()
      navigate({ to: `/conversations/${result.createAiConversation?.id}` })
    },
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    const assistantIds = formData
      .getAll('assistants')
      .map((id) => id.toString())
    const userIds = formData.getAll('users').map((id) => id.toString())

    console.log({ assistantIds, userIds })

    mutate({ assistantIds, userIds })
  }

  return (
    <dialog className="modal" ref={ref}>
      <LoadingSpinner isLoading={isPending} />
      <div className="modal-box">
        <h3 className="font-bold text-lg">Create a new conversation</h3>
        <p className="py-0">
          You are about to start a new conversation with the selected users and
          assistants.
        </p>
        <p className="py-4">You can change these participants any time.</p>
        <form method="dialog" onSubmit={handleSubmit}>
          <div className="flex flex-row gap-2 justify-items-stretch">
            <div>
              <h4 className="underline">Assistants</h4>
              {assistants.map((assistant) => (
                <label
                  key={assistant.id}
                  className="cursor-pointer label gap-2"
                >
                  <input
                    type="checkbox"
                    name="assistants"
                    value={assistant.id}
                    defaultChecked
                    className="checkbox checkbox-info"
                  />
                  <span className="label-text">{assistant.name}</span>
                </label>
              ))}
            </div>
            <div>
              <h4 className="underline">Users</h4>
              {users.map((user) => (
                <label key={user.id} className="cursor-pointer label gap-2">
                  <input
                    type="checkbox"
                    name="users"
                    value={user.id}
                    defaultChecked
                    className="checkbox checkbox-info"
                  />
                  <span className="label-text">{user.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={() => ref.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isPending || !assistants}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}
