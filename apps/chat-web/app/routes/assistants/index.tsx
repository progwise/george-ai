import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import { useAuth } from '../../auth/auth-hook'
import { AssistantCard } from '../../components/assistant/assistant-card'
import { LoadingSpinner } from '../../components/loading-spinner'
import { queryKeys } from '../../query-keys'
import { getMyAiAssistants } from '../../server-functions/assistants'

export const Route = createFileRoute('/assistants/')({
  component: RouteComponent,
})

function RouteComponent() {
  const authContext = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.AiAssistants, authContext?.user?.id],
    enabled: !!authContext?.user,
    queryFn: async () => {
      if (!authContext?.user?.id) {
        return null
      } else {
        return getMyAiAssistants({ data: authContext.user.id })
      }
    },
  })
  const isLoggendIn = !!authContext?.user

  return (
    <article className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">
          {!isLoggendIn ? (
            <button type="button" className="btn btn-ghost" onClick={() => authContext?.login()}>
              Log in to see your assistants
            </button>
          ) : (
            'My Assistants'
          )}
        </h3>
        <LoadingSpinner isLoading={isLoading} />
        {isLoggendIn && (
          <Link type="button" className="btn btn-primary btn-sm" to="/assistants/new">
            Add new
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        {data?.aiAssistants?.map((assistant) => <AssistantCard key={assistant.id} assistant={assistant} />)}
      </div>
    </article>
  )
}
