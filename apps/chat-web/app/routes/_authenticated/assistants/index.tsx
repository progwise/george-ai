import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import { AssistantCard } from '../../../components/assistant/assistant-card'
import { AssistantNewDialog } from '../../../components/assistant/assistant-new-dialog'
import { LoadingSpinner } from '../../../components/loading-spinner'
import { graphql } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'

const getMyAiAssistants = createServerFn({ method: 'GET' }).handler(() =>
  backendRequest(
    graphql(`
      query aiAssistantCards {
        aiAssistants {
          id
          ...AssistantCard_Assistant
        }
      }
    `),
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
      return getMyAiAssistants()
    },
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <article className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">
          <span>{t('assistants.myAssistants')}</span>
        </h3>
        {<AssistantNewDialog />}
      </div>

      <div className="flex flex-wrap gap-4">
        {!data?.aiAssistants || data.aiAssistants.length < 1 ? (
          <h3>{t('assistants.noAssistantsFound')}</h3>
        ) : (
          data?.aiAssistants?.map((assistant) => <AssistantCard key={assistant.id} assistant={assistant} />)
        )}
      </div>
    </article>
  )
}
