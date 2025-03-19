import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { useAuth } from '../../auth/auth-hook'
import { FragmentType } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { queryKeys } from '../../query-keys'
import { createConversation } from '../../server-functions/conversations'
import { LoadingSpinner } from '../loading-spinner'
import {
  ParticipantSelectionData,
  ParticipantsSelector,
  ParticipantsSelector_AssistantsFragment,
  ParticipantsSelector_HumansFragment,
} from './participants-selector'

interface NewConversationDialogProps {
  assistants: FragmentType<typeof ParticipantsSelector_AssistantsFragment>[] | null
  humans: FragmentType<typeof ParticipantsSelector_HumansFragment>[] | null
  isOpen: boolean
}

export const NewConversationDialog = (props: NewConversationDialogProps) => {
  const authContext = useAuth()
  const user = authContext.user

  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const dialogReference = useRef<HTMLDialogElement>(null)

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

      if (dialogReference.current) {
        dialogReference.current.close()
      }
      queryClient.invalidateQueries({ queryKey: [queryKeys.Conversations, user.id] })
      if (result?.createAiConversation) {
        navigate({ to: `/conversations/${result.createAiConversation.id}` })
      }
    },
  })

  const handleSubmit = ({ assistantIds, userIds }: ParticipantSelectionData) => {
    mutate({ assistantIds, userIds })
  }

  useEffect(() => {
    if (props.isOpen) {
      dialogReference.current?.showModal()
    }
  }, [props.isOpen])

  if (!user) {
    return (
      <button type="button" className="btn btn-outline" onClick={() => authContext?.login()}>
        {t('texts.signInForConversations')}
      </button>
    )
  }

  return (
    <>
      <button type="button" className="btn btn-primary btn-sm" onClick={() => dialogReference.current?.showModal()}>
        {t('actions.new')}
      </button>
      <LoadingSpinner isLoading={isPending} />
      <ParticipantsSelector
        assistants={props.assistants}
        humans={props.humans}
        onSubmit={handleSubmit}
        isNewConversation
        dialogRef={dialogReference}
      />
    </>
  )
}
