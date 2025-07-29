import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { getProfileQueryOptions } from '../../../auth/get-profile-query'
import { getAiAssistantsQueryOptions } from '../../../components/assistant/get-assistants'
import { ConversationForm } from '../../../components/conversation/conversation-form'
import { ConversationHistory } from '../../../components/conversation/conversation-history'
import { ConversationParticipants } from '../../../components/conversation/conversation-participants'
import { DeleteLeaveConversationDialog } from '../../../components/conversation/delete-leave-conversation-dialog'
import { getConversationQueryOptions } from '../../../components/conversation/get-conversation'
import { NewConversationSelector } from '../../../components/conversation/new-conversation-selector'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { BackIcon } from '../../../icons/back-icon'
import { MenuIcon } from '../../../icons/menu-icon'
import { getUsersQueryOptions } from '../../../server-functions/users'

export const Route = createFileRoute('/_authenticated/conversations/$conversationId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getUsersQueryOptions()),
      context.queryClient.ensureQueryData(getAiAssistantsQueryOptions()),
      context.queryClient.ensureQueryData(getConversationQueryOptions(params.conversationId)),
      context.queryClient.ensureQueryData(getProfileQueryOptions()),
    ])
  },
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const { conversationId } = Route.useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    data: { users },
  } = useSuspenseQuery(getUsersQueryOptions())
  const {
    data: { aiAssistants },
  } = useSuspenseQuery(getAiAssistantsQueryOptions())
  const { data: conversation } = useSuspenseQuery(getConversationQueryOptions(conversationId))
  const { data: profile } = useSuspenseQuery(getProfileQueryOptions())

  return (
    <>
      <div className="bg-base-100 lg:rounded-r-box sticky top-16 z-30 shadow-md">
        <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center gap-2 sm:w-64">
            <label htmlFor="conversation-drawer" className="drawer-button btn btn-sm lg:hidden">
              <MenuIcon className="size-6" />
            </label>
            <div className="w-full lg:hidden">
              <NewConversationSelector users={users} assistants={aiAssistants} userId={user.id} />
            </div>
          </div>
          <div className="flex min-w-0 items-center justify-end gap-2">
            <ConversationParticipants
              conversation={conversation}
              assistants={aiAssistants}
              users={users}
              userId={user.id}
            />
            <DeleteLeaveConversationDialog conversation={conversation} userId={user.id} />
            <button
              type="button"
              onClick={() => navigate({ to: '..' })}
              className="btn btn-sm tooltip tooltip-left"
              data-tip={t('tooltips.goToOverview')}
            >
              <BackIcon />
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-full flex-col">
        <ConversationHistory conversation={conversation} userId={user.id} />
        <ConversationForm conversation={conversation} user={user} profile={profile ?? undefined} />
      </div>
    </>
  )
}
