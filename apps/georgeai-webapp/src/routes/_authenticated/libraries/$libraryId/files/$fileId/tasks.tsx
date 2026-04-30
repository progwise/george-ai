import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { getProcessingRequestsQueryOptions } from '../../../../../../components/workspace/queries'
import type { GetEventQueueRequestsQuery } from '../../../../../../gql/graphql'
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

type RequestItem = GetEventQueueRequestsQuery['eventQueueRequests']['requests'][number]

const ACTION_BADGE: Record<string, string> = {
  documentExtraction: 'badge-info',
  documentVectorization: 'badge-primary',
  fieldEnrichment: 'badge-secondary',
  migrateFile: 'badge-warning',
  analyzeImage: 'badge-accent',
}

const ACTION_LABEL: Record<string, string> = {
  documentExtraction: 'Extraction',
  documentVectorization: 'Vectorization',
  fieldEnrichment: 'Enrichment',
  migrateFile: 'Migration',
  analyzeImage: 'Image Analysis',
}

function RequestDetails({ item }: { item: RequestItem }) {
  switch (item.__typename) {
    case 'DocumentExtractionRequest':
      return (
        <span className="flex gap-3 text-sm">
          <span className="font-mono opacity-60">{item.documentId}</span>
          <span className="opacity-30">·</span>
          <span>{item.extractionMethod}</span>
        </span>
      )
    case 'DocumentVectorizationRequest':
      return (
        <span className="flex gap-3 text-sm">
          <span className="font-mono opacity-60">{item.documentId}</span>
          <span className="opacity-30">·</span>
          <span>{item.embeddingModel}</span>
          {item.embeddingDriver && <span className="badge badge-ghost badge-xs">{item.embeddingDriver}</span>}
        </span>
      )
    case 'FieldEnrichmentRequest':
      return (
        <span className="flex gap-3 text-sm">
          <span className="font-mono opacity-60">{item.fieldId}</span>
          <span className="opacity-30">·</span>
          <span>{item.chatModelName}</span>
        </span>
      )
    case 'AnalyzeImageRequest':
      return (
        <span className="flex gap-3 text-sm">
          <span>{item.fileName}</span>
          <span className="badge badge-ghost badge-xs">{item.mimeType}</span>
          {item.context && <span className="opacity-60">{item.context}</span>}
        </span>
      )
    default:
      return null
  }
}

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const { action, take, startSequence } = Route.useSearch()
  const { t } = useTranslation()

  const { data, isLoading, error } = useQuery(
    getProcessingRequestsQueryOptions({
      workspaceId: user.selectedWorkspaceId,
      action,
      take,
      startSequence,
    }),
  )

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('files.processingTasks')}</h1>
        {!!data?.totalMessages && (
          <div className="flex gap-2 text-sm opacity-50">
            <span>{t('libraries.totalRequests', { total: data.totalMessages })}</span>
            <span>·</span>
            <span>{t('libraries.lastSequence', { last: data.lastSequence })}</span>
          </div>
        )}
      </div>

      {isLoading && <div className="loading loading-sm loading-spinner" />}

      {error && (
        <div className="alert text-sm alert-error">
          {t('errors.withColon')} {(error as Error).message}
        </div>
      )}

      {!isLoading && data?.requests.length === 0 && (
        <div className="flex flex-1 items-center justify-center opacity-40">No tasks found</div>
      )}

      {!!data?.requests.length && (
        <div className="overflow-x-auto rounded-box border border-base-300">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Action</th>
                <th>Timestamp</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {data.requests.map((item) => (
                <tr key={`${item.action}-${item.timestamp}`} className="hover:bg-base-200">
                  <td>
                    <span className={`badge badge-sm ${ACTION_BADGE[item.action] ?? 'badge-ghost'}`}>
                      {ACTION_LABEL[item.action] ?? item.action}
                    </span>
                  </td>
                  <td className="text-sm whitespace-nowrap opacity-60">{new Date(item.timestamp).toLocaleString()}</td>
                  <td>
                    <RequestDetails item={item} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
