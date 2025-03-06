import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { useAuth } from '../../auth/auth-hook'
import { FragmentType, graphql, useFragment } from '../../gql'
import { createConversation } from '../../server-functions/conversations'
import { LoadingSpinner } from '../loading-spinner'

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
  assistants: FragmentType<typeof ConversationNew_AssistantParticipationCandidatesFragment>[] | null
  humans: FragmentType<typeof ConversationNew_HumanParticipationCandidatesFragment>[] | null
  isOpen: boolean
}

export const NewConversationDialog = (props: NewConversationDialogProps) => {
  const { user } = useAuth()
  const assistants = useFragment(ConversationNew_AssistantParticipationCandidatesFragment, props.assistants)
  const humans = useFragment(ConversationNew_HumanParticipationCandidatesFragment, props.humans)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ assistantIds, userIds }: { assistantIds: string[]; userIds: string[] }) => {
      if (!user?.id) {
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
      navigate({ to: `/conversations/${result.createAiConversation?.id}` })
    },
  })

  useEffect(() => {
    if (props.isOpen) {
      dialogReference.current?.showModal()
    }
  }, [props.isOpen])

  const dialogReference = useRef<HTMLDialogElement>(null)

  const handleCreateConversation = async () => {
    try {
      const form = document.querySelector('form')
      if (!form) {
        throw new Error('Form not found')
      }
      const formData = new FormData(form)

      const assistantIds = formData.getAll('assistants').map((id) => id.toString())
      const userIds = formData.getAll('users').map((id) => id.toString())

      await mutate({ assistantIds, userIds })
    } catch {
      /* empty */
    }
    dialogReference.current?.close()
  }

  if (!user) {
    return <h3>Login to use conversations.</h3>
  }

  return (
    <>
      <button type="button" className="btn btn-primary btn-sm" onClick={() => dialogReference.current?.showModal()}>
        New
      </button>
      <dialog className="modal" ref={dialogReference}>
        <LoadingSpinner isLoading={isPending} />
        <div className="modal-box">
          <h3 className="text-lg font-bold">Create a new conversation</h3>
          <p className="py-0">You are about to start a new conversation with the selected users and assistants.</p>
          <p className="py-4">You can change these participants any time.</p>
          <div className="flex flex-row justify-items-stretch gap-2">
            <div>
              <h4 className="underline">Assistants</h4>
              {assistants?.map((assistant) => (
                <label key={assistant.id} className="label cursor-pointer justify-start gap-2">
                  <input
                    type="checkbox"
                    name="assistants"
                    value={assistant.id}
                    defaultChecked
                    className="checkbox-info checkbox"
                  />
                  <span className="label-text">{assistant.name}</span>
                </label>
              ))}
            </div>
            <div>
              <h4 className="underline">Users</h4>
              {humans?.map((user) => (
                <label key={user.id} className="label cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    name="users"
                    value={user.id}
                    defaultChecked
                    className="checkbox-info checkbox"
                  />
                  <span className="label-text">{user.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button type="submit" className="btn btn-sm">
                Cancel
              </button>
            </form>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isPending || !assistants}
              onClick={handleCreateConversation}
            >
              Create
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="submit">close</button>
        </form>
      </dialog>
    </>
  )
}
