import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useRef } from 'react'

import { useAuth } from '../../auth/auth-hook'
import { FragmentType, graphql, useFragment } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { queryKeys } from '../../query-keys'
import { createConversation } from '../../server-functions/conversations'
import { LoadingSpinner } from '../loading-spinner'
import { ParticipantsDialog } from './participants-dialog'

const NewConversationSelector_AssistantsFragment = graphql(`
  fragment NewConversationSelector_Assistants on AiAssistant {
    id
    ...ParticipantsDialog_Assistants
  }
`)

export const NewConversationSelector_HumansFragment = graphql(`
  fragment NewConversationSelector_Humans on User {
    id
    username
    ...ParticipantsDialog_Humans
  }
`)

interface NewConversationSelectorProps {
  assistants: FragmentType<typeof NewConversationSelector_AssistantsFragment>[]
  humans: FragmentType<typeof NewConversationSelector_HumansFragment>[]
  isOpen: boolean
}

export const NewConversationSelector = (props: NewConversationSelectorProps) => {
  const authContext = useAuth()
  const user = authContext.user

  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const assistants = useFragment(NewConversationSelector_AssistantsFragment, props.assistants)
  const humans = useFragment(NewConversationSelector_HumansFragment, props.humans)

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

      dialogRef.current?.close()
    },
  })

  const handleSubmit = ({ assistantIds, userIds }: { assistantIds: string[]; userIds: string[] }) => {
    mutate({ assistantIds, userIds })
  }

  if (!user) {
    return (
      <button type="button" className="btn btn-outline" onClick={() => authContext?.login()}>
        {t('texts.signInForConversations')}
      </button>
    )
  }

  return (
    <>
      <button type="button" className="btn btn-primary btn-sm" onClick={() => dialogRef.current?.showModal()}>
        {t('actions.new')}
      </button>
      <LoadingSpinner isLoading={isPending} />
      <ParticipantsDialog
        assistants={assistants}
        humans={humans}
        onSubmit={handleSubmit}
        isNewConversation
        dialogRef={dialogRef}
        isOpen={props.isOpen}
      />
    </>
  )
}
