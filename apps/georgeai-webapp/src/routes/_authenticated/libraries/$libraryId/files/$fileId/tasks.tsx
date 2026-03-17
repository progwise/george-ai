import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { getProcessingRequestsQueryOptions } from '../../../../../../components/workspace/queries'
import { EventQueueAction } from '../../../../../../gql/graphql'
import { EventQueueActionSchema } from '../../../../../../gql/validation'
import { useTranslation } from '../../../../../../i18n/use-translation-hook'

export const Route = createFileRoute('/_authenticated/libraries/$libraryId/files/$fileId/tasks')({
  component: RouteComponent,
  validateSearch: z.object({
    startSequence: z.coerce.number().optional(),
    take: z.coerce.number().default(20),
    action: EventQueueActionSchema.optional(),
  }),
  loaderDeps: ({ search: { startSequence, take } }) => ({
    startSequence,
    take,
  }),
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const { fileId } = Route.useParams()
  const { action, take, startSequence } = Route.useSearch()
  const { t } = useTranslation()

  const { data, isLoading, error } = useQuery(
    getProcessingRequestsQueryOptions({
      workspaceId: user.selectedWorkspaceId,
      action: !action ? EventQueueAction.DocumentExtraction : action,
      take,
      startSequence,
    }),
  )

  return (
    <div className="flex h-full flex-col items-center gap-2">
      <h1 className="text-2xl font-bold">
        {t('files.processingTasks')} {fileId}
      </h1>
      {isLoading && <div className="loading loading-sm loading-spinner"></div>}
      {error && (
        <div className="text-error">
          {t('errors.withColon')}
          {(error as Error).message}
        </div>
      )}
      {data && (
        <div className="w-full">
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
