import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { AssistantCard } from '../../../components/assistant/assistant-card'
import { AssistantNewDialog } from '../../../components/assistant/assistant-new-dialog'
import { LoadingSpinner } from '../../../components/loading-spinner'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { getAiAssistantsQueryOptions } from '../../../server-functions/assistant'

export const Route = createFileRoute('/_authenticated/assistants/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const { t } = useTranslation()
  const { data, isLoading } = useQuery(getAiAssistantsQueryOptions(user.id))

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <article className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">
          <span>{t('assistants.myAssistants')}</span>
        </h3>
        {<AssistantNewDialog userId={user.id} />}
      </div>

      <div className="flex flex-wrap gap-4">
        {!data?.aiAssistants || data.aiAssistants.length < 1 ? (
          <h3>{t('assistants.noAssistantsFound')}</h3>
        ) : (
          data?.aiAssistants?.map((assistant) => (
            <AssistantCard key={assistant.id} assistant={assistant} userId={user.id} />
          ))
        )}
      </div>
    </article>
  )
}
