import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { useAuth } from '../../auth/auth-hook'
import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { queryKeys } from '../../query-keys'
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
  const authContext = useAuth()
  const user = authContext.user

  const assistants = useFragment(ConversationNew_AssistantParticipationCandidatesFragment, props.assistants)
  const humans = useFragment(ConversationNew_HumanParticipationCandidatesFragment, props.humans)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { t } = useTranslation()

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
    onSettled: (result) => {
      if (!user) {
        throw new Error('User not set')
      }
      queryClient.invalidateQueries({ queryKey: [queryKeys.Conversations, user.id] })
      if (result?.createAiConversation) {
        navigate({ to: `/conversations/${result.createAiConversation.id}` })
      }
    },
  })

  useEffect(() => {
    if (props.isOpen) {
      dialogReference.current?.showModal()
    }
  }, [props.isOpen])

  const dialogReference = useRef<HTMLDialogElement>(null)

  const handleCreateConversation = async () => {
    const form = document.querySelector('form')
    if (!form) {
      throw new Error('Form not found')
    }
    const formData = new FormData(form)

    const assistantIds = formData.getAll('assistants').map((id) => id.toString())
    const userIds = formData.getAll('users').map((id) => id.toString())

    await mutate({ assistantIds, userIds })

    dialogReference.current?.close()
  }

  if (!user) {
    return (
      <button type="button" className="btn btn-ghost" onClick={() => authContext?.login()}>
        {t('texts.signInForConversations')}
      </button>
    )
  }

  return (
    <>
      <button type="button" className="btn btn-primary btn-sm" onClick={() => dialogReference.current?.showModal()}>
        {t('actions.new')}
      </button>
      <dialog className="modal" ref={dialogReference}>
        <LoadingSpinner isLoading={isPending} />
        <div className="modal-box">
          <h3 className="text-lg font-bold">{t('texts.newConversation')}</h3>
          <p className="py-0">{t('texts.newConversationConfirmation')}</p>
          <p className="py-4">{t('texts.changeParticipantsAnytime')}</p>
          <div className="flex flex-row justify-items-stretch gap-2">
            <div>
              <h4 className="underline">{t('conversations.assistants')}</h4>
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
              <h4 className="underline">{t('conversations.humans')}</h4>
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
                {t('actions.cancel')}
              </button>
            </form>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isPending || !assistants}
              onClick={handleCreateConversation}
            >
              {t('actions.create')}
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
