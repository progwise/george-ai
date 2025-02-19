import { RefObject } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createConversation } from '../../server-functions/conversations'
import { LoadingSpinner } from '../loading-spinner'
import { useNavigate } from '@tanstack/react-router'
import { FragmentType, graphql, useFragment } from '../../gql'
import { useAuth } from '../../auth/auth-context'

const ConversationNew_HumanParticipationCandidatesFragment = graphql(`
  fragment ConversationNew_HumanParticipationCandidates on User {
    id
    name
    username
  }
`)

const ConversationNew_AssistantParticipationCandidatesFragment = graphql(`
  fragment ConversationNew_AssistantParticipationCandidates on AiAssistant {
    id
    name
  }
`)

interface NewConversationDialogProps {
  assistants:
    | FragmentType<
        typeof ConversationNew_AssistantParticipationCandidatesFragment
      >[]
    | null
  humans:
    | FragmentType<
        typeof ConversationNew_HumanParticipationCandidatesFragment
      >[]
    | null
  ref: RefObject<HTMLDialogElement | null>
}

export const NewConversationDialog = (props: NewConversationDialogProps) => {
  const { user } = useAuth()
  const ref = props.ref
  const assistants = useFragment(
    ConversationNew_AssistantParticipationCandidatesFragment,
    props.assistants,
  )
  const humans = useFragment(
    ConversationNew_HumanParticipationCandidatesFragment,
    props.humans,
  )
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
      if (!user) {
        throw new Error('User not set')
      }
      return await createConversation({
        data: {
          userIds: [...userIds, user.id],
          assistantIds: [...assistantIds],
        },
      })
    },
    onSuccess: (result) => {
      if (!user) {
        throw new Error('User not set')
      }
      queryClient.invalidateQueries({ queryKey: ['conversations', user.id] })
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

    mutate({ assistantIds, userIds })
  }

  if (!user) {
    return <h3>Login to use conversations.</h3>
  }

  return (
    <dialog className="modal" ref={props.ref}>
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
              {assistants?.map((assistant) => (
                <label
                  key={assistant.id}
                  className="cursor-pointer label gap-2 justify-start"
                >
                  <input
                    type="checkbox"
                    name="assistants"
                    value={assistant.id}
                    defaultChecked
                    className="checkbox checkbox-info"
                  />
                  <span className="label-text ">{assistant.name}</span>
                </label>
              ))}
            </div>
            <div>
              <h4 className="underline">Users</h4>
              {humans?.map((user) => (
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
