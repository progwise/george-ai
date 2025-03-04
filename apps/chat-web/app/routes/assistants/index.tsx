import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { AssistantCard } from '../../components/assistant/assistant-card'
import { queryKeys } from '../../query-keys'
import { useAuth } from '../../auth/auth-hook'
import { LoadingSpinner } from '../../components/loading-spinner'
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
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold">
          {!isLoggendIn ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => authContext?.login()}
            >
              Log in to see your assistants
            </button>
          ) : (
            'My Assistants'
          )}
        </h3>
        <LoadingSpinner isLoading={isLoading} />
        {isLoggendIn && (
          <Link
            type="button"
            className="btn btn-primary btn-sm"
            to="/assistants/new"
          >
            Add new
          </Link>
        )}
      </div>

      <div className="flex gap-4 flex-wrap">
        {data?.aiAssistants?.map((assistant) => (
          <AssistantCard key={assistant.id} assistant={assistant} />
        ))}
      </div>
    </article>
  )
}
