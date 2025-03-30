import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { useAuth } from '../../auth/auth-hook'
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
      graphql(/* GraphQL */ `
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
  const authContext = useAuth()
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.MyAiAssistants, authContext?.user?.id],
    queryFn: async () => {
      return getMyAiAssistants({ data: authContext.user!.id! })
    },
    enabled: !!authContext?.user?.id,
  })
  const isLoggendIn = !!authContext?.user

  return (
    <article className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">
          {!isLoggendIn ? (
            <button type="button" className="btn btn-ghost" onClick={() => authContext?.login()}>
              {t('assistants.signInForAssistants')}
            </button>
          ) : (
            <span>{t('assistants.myAssistants')}</span>
          )}
        </h3>
        {isLoggendIn && <AssistantNewDialog />}
      </div>

      <div className="flex flex-wrap gap-4">
        {!data?.aiAssistants || isLoading ? (
          <LoadingSpinner />
        ) : (
          data?.aiAssistants?.map((assistant) => <AssistantCard key={assistant.id} assistant={assistant} />)
        )}
      </div>
    </article>
  )
}
