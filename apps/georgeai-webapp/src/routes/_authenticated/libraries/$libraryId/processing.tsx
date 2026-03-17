import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { getProcessingRequestsQueryOptions } from '../../../../components/workspace/queries'
import { EventQueueAction } from '../../../../gql/graphql'
import { useTranslation } from '../../../../i18n/use-translation-hook'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/processing')({
  component: RouteComponent,
  validateSearch: z.object({
    startSequence: z.coerce.number().optional(),
    take: z.coerce.number().default(20),
    action: z.nativeEnum(EventQueueAction).optional(),
  }),
  loaderDeps: ({ search: { startSequence, take } }) => ({
    startSequence,
    take,
  }),
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const { libraryId } = Route.useParams()
  const { startSequence, take, action } = Route.useSearch()
  const { t } = useTranslation()

  const { data, isLoading, error } = useQuery(
    getProcessingRequestsQueryOptions({
      workspaceId: user.selectedWorkspaceId,
      startSequence,
      take,
      action: action ? action : EventQueueAction.DocumentExtraction,
    }),
  )

  return (
    <div className="flex h-full flex-col gap-2">
      <h1 className="text-2xl font-bold">
        {t('libraries.processingTasks')}
        {libraryId}
      </h1>
      {isLoading && <div className="loading loading-sm loading-spinner"></div>}
      {error && (
        <div className="text-error">
          {t('errors.withColon')}
          {(error as Error).message}
        </div>
      )}
      {data && (
        <div>
          <p>{t('libraries.totalRequests', { total: data.totalMessages })} </p>
          <p>{t('libraries.lastSequence', { last: data.lastSequence })}</p>
          <ul>
            {data.requests.map((item) => (
              <li key={`item-${item.action}-${item.timestamp}`}>
                <div>{t('libraries.action', { action: item.action })}</div>
                <div>{t('libraries.timestamp', { stamp: item.timestamp })}</div>
                <pre>
                  <code lang="json">{JSON.stringify(item)}</code>
                </pre>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
