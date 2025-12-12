import { useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

import { getAiAssistantsQueryOptions } from '../../../components/assistant/get-assistants'
import { ConversationParticipantsDialogButton } from '../../../components/conversation/conversation-participants-dialog-button'
import { getConversationsQueryOptions } from '../../../components/conversation/get-conversations'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { getUsersQueryOptions } from '../../../server-functions/users'

export const Route = createFileRoute('/_authenticated/conversations/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const { t } = useTranslation()
  const navigate = Route.useNavigate()

  const [conversationsQuery, usersQuery, assistantsQuery] = useSuspenseQueries({
    queries: [getConversationsQueryOptions(), getUsersQueryOptions(), getAiAssistantsQueryOptions()],
  })

  const latestConversation = conversationsQuery.data.aiConversations.at(0)

  useEffect(() => {
    if (latestConversation) {
      navigate({
        to: '/conversations/$conversationId',
        params: { conversationId: latestConversation.id },
        replace: true,
      })
    }
  }, [latestConversation, navigate])

  return (
    <div className="absolute flex h-screen w-full">
      <div className="mx-auto prose mt-8">
        <p>{t('conversations.firstConversation')}</p>
        <ConversationParticipantsDialogButton
          assistants={assistantsQuery.data.aiAssistants}
          users={usersQuery.data.users}
          userId={user.id}
          variant="primary"
        />
      </div>
    </div>
  )
}
