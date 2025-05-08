import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { AssistantCard } from '../../../components/assistant/assistant-card'
import { AssistantNewDialog } from '../../../components/assistant/assistant-new-dialog'
import { LoadingSpinner } from '../../../components/loading-spinner'
import { graphql } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const getMyAiAssistants = createServerFn({ method: 'GET' })
  .validator((userId: string) => z.string().nonempty().parse(userId))
  .handler((ctx) =>
    backendRequest(
      graphql(/* GraphQL */ `
        query aiAssistantCards($userId: String!) {
          aiAssistants(userId: $userId) {
            id
            ...AssistantCard_Assistant
          }
        }
      `),
      {
        userId: ctx.data,
      },
    ),
  )

export const Route = createFileRoute('/_authenticated/assistants/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.MyAiAssistants, user.id],
    queryFn: async () => {
      return getMyAiAssistants({ data: user.id })
    },
  })

  return (
    <article className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">
          <span>{t('assistants.myAssistants')}</span>
        </h3>
        {<AssistantNewDialog userId={user.id} />}
      </div>

      <div className="flex flex-wrap gap-4">
        {!data?.aiAssistants || isLoading ? (
          <LoadingSpinner />
        ) : (
          data?.aiAssistants?.map((assistant) => (
            <AssistantCard key={assistant.id} assistant={assistant} userId={user.id} />
          ))
        )}
      </div>
    </article>
  )
}
