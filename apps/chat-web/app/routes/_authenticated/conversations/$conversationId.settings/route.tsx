import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

import { getConversationQueryOptions } from '../../../../server-functions/conversations'

export const Route = createFileRoute('/_authenticated/conversations/$conversationId/settings')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(getConversationQueryOptions(params.conversationId))
  },
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const { conversationId } = Route.useParams()
  const { data: conversation } = useSuspenseQuery(getConversationQueryOptions(conversationId))

  return (
    <dialog className="modal" onClose={() => navigate({ to: '/conversations/$conversationId', replace: true })} open>
      <div className="modal-box bg-base-200">
        <h3 className="text-lg font-bold">Conversation Settings</h3>
        <div className="py-4">
          <div role="tablist" className="tabs tabs-lift">
            <Link
              to="/conversations/$conversationId/settings"
              params={{ conversationId }}
              activeProps={() => ({ className: 'tab-active' })}
              activeOptions={{ exact: true }}
              className="tab gap-2"
              replace
            >
              Assistants <div className="badge badge-primary badge-soft badge-sm">{conversation.assistants.length}</div>
            </Link>
            <Link
              to="/conversations/$conversationId/settings/users"
              params={{ conversationId }}
              activeProps={{ className: 'tab-active' }}
              className="tab gap-2"
              replace
            >
              Users <div className="badge badge-primary badge-soft badge-sm">{conversation.humans.length}</div>
            </Link>
          </div>
          <div className="bg-base-100 border-base-300 rounded-field -mt-px rounded-tl-none border">
            <Outlet />
          </div>
        </div>

        <div className="modal-action">
          <Link
            to="/conversations/$conversationId/leave"
            params={{ conversationId }}
            className="btn btn-error btn-soft"
            replace
          >
            Leave
          </Link>

          <form method="dialog">
            <button type="submit" className="btn">
              Close
            </button>
          </form>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button type="submit">close</button>
      </form>
    </dialog>
  )
}
