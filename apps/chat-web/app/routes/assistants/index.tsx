import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { useAuth } from '../../auth/auth'
import { AssistantCard } from '../../components/assistant/assistant-card'
import { AssistantNewDialog } from '../../components/assistant/assistant-new-dialog'
import { LoadingSpinner } from '../../components/loading-spinner'
import { graphql } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'

const getMyAiAssistants = createServerFn({ method: 'GET' })
  .validator((ownerId: string) => z.string().nonempty().parse(ownerId))
  .handler((ctx) =>
    backendRequest(
      graphql(`
        query aiAssistantCards($ownerId: String!) {
          aiAssistants(ownerId: $ownerId) {
            id
            ...AssistantCard_Assistant
          }
        }
      `),
      {
        ownerId: ctx.data,
      },
    ),
  )

export const Route = createFileRoute('/assistants/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { login } = useAuth()
  const { user } = Route.useRouteContext()
  const userId = user?.id
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.MyAiAssistants, userId],
    queryFn: async () => {
      return getMyAiAssistants({ data: userId! })
    },
    enabled: !!userId,
  })
  const isLoggedIn = !!user

  if (!isLoggedIn) {
    return (
      <button type="button" className="btn btn-ghost" onClick={() => login()}>
        {t('actions.signInForAssistants')}
      </button>
    )
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <article className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">
          <span>{t('assistants.myAssistants')}</span>
        </h3>
        {isLoggedIn && <AssistantNewDialog userId={userId} />}
      </div>

      <div className="flex flex-wrap gap-4">
        {!data?.aiAssistants || data.aiAssistants.length < 1 ? (
          <h3>{t('assistants.noAssistantsFound')}</h3>
        ) : (
          data?.aiAssistants?.map((assistant) => (
            <AssistantCard key={assistant.id} assistant={assistant} userId={userId} />
          ))
        )}
      </div>
    </article>
  )
}
