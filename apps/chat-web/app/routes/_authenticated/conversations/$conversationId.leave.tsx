import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import { dateString } from '@george-ai/web-utils'

import { toastError } from '../../../components/georgeToaster'
import { LoadingSpinner } from '../../../components/loading-spinner'
import { useTranslation } from '../../../i18n/use-translation-hook'
import {
  deleteConversation,
  getConversationQueryOptions,
  getConversationsQueryOptions,
  leaveConversation,
} from '../../../server-functions/conversations'

export const Route = createFileRoute('/_authenticated/conversations/$conversationId/leave')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(getConversationQueryOptions(params.conversationId))
  },
})

function RouteComponent() {
  const { conversationId } = Route.useParams()
  const { user } = Route.useRouteContext()
  const navigate = Route.useNavigate()

  const queryClient = useQueryClient()
  const { data: conversation } = useSuspenseQuery(getConversationQueryOptions(conversationId))
  const { t, language } = useTranslation()

  const action = conversation.ownerId === user.id ? 'delete' : 'leave'

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (action === 'delete') {
        return await deleteConversation({ data: { conversationId } })
      }

      return await leaveConversation({ data: { conversationId } })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getConversationsQueryOptions())
    },
    onSuccess: () => {
      navigate({ to: '/conversations', replace: true })
    },
    onError: () => {
      // TODO: translate error message
      toastError('An error occurred while trying to leave or delete the conversation.')
    },
  })

  const title = action === 'delete' ? t('conversations.deleteConversation') : t('conversations.leave')
  const description = action === 'delete' ? t('conversations.deleteConfirmation') : t('conversations.leaveConfirmation')
  const submitButtonText = action === 'delete' ? t('actions.delete') : t('actions.leave')

  return (
    <>
      <LoadingSpinner isLoading={isPending} />

      <dialog className="modal" onClose={() => navigate({ to: '/conversations/$conversationId', replace: true })} open>
        <div className="modal-box">
          <h3 className="text-lg font-bold">
            {title} ({dateString(conversation.createdAt, language)})
          </h3>
          <p className="py-4">{description}</p>

          {conversation.assistants.length > 0 && (
            <p>
              {t('texts.with')}{' '}
              <span className="font-medium">
                {conversation.assistants.map((assistant) => assistant.name).join(', ')}
              </span>
            </p>
          )}
          <div className="modal-action">
            <button type="button" className="btn btn-primary" onClick={() => mutate()}>
              {submitButtonText}
            </button>

            <Link to="/conversations/$conversationId/settings" params={{ conversationId }} className="btn" replace>
              {t('actions.cancel')}
            </Link>
          </div>
        </div>
      </dialog>
    </>
  )
}
