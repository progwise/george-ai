import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { getAutomationBatchesQueryOptions, getAutomationQueryOptions } from '../../../../components/automations/queries'
import { useTranslation } from '../../../../i18n/use-translation-hook'

export const Route = createFileRoute('/_authenticated/automations/$automationId/batches')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getAutomationQueryOptions(params.automationId)),
      context.queryClient.ensureQueryData(getAutomationBatchesQueryOptions({ automationId: params.automationId })),
    ])
  },
})

function RouteComponent() {
  const { t } = useTranslation()
  const { automationId } = Route.useParams()

  useSuspenseQuery(getAutomationQueryOptions(automationId))

  const { data } = useSuspenseQuery(getAutomationBatchesQueryOptions({ automationId }))

  return (
    <div className="space-y-6">
      <div className="prose">
        <h3>{t('automations.batchHistory')}</h3>
      </div>

      {data.automationBatches.length === 0 ? (
        <div className="text-base-content/50 py-8 text-center">{t('automations.noBatches')}</div>
      ) : (
        <table className="table-zebra table w-full">
          <thead>
            <tr>
              <th>{t('automations.batchStatus')}</th>
              <th>{t('automations.batchTriggeredBy')}</th>
              <th>{t('automations.batchProgress')}</th>
              <th>{t('automations.batchStarted')}</th>
              <th>{t('automations.batchFinished')}</th>
            </tr>
          </thead>
          <tbody>
            {data.automationBatches.map((batch) => (
              <tr key={batch.id}>
                <td>
                  <span
                    className={`badge ${
                      batch.status === 'COMPLETED'
                        ? 'badge-success'
                        : batch.status === 'FAILED'
                          ? 'badge-error'
                          : batch.status === 'COMPLETED_WITH_ERRORS'
                            ? 'badge-warning'
                            : batch.status === 'RUNNING'
                              ? 'badge-info'
                              : 'badge-ghost'
                    }`}
                  >
                    {batch.status}
                  </span>
                </td>
                <td>{batch.triggeredBy}</td>
                <td>
                  {batch.itemsProcessed}/{batch.itemsTotal}
                  {batch.itemsFailed > 0 && <span className="text-error ml-2">({batch.itemsFailed} failed)</span>}
                </td>
                <td>{batch.startedAt ? new Date(batch.startedAt).toLocaleString() : '-'}</td>
                <td>{batch.finishedAt ? new Date(batch.finishedAt).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
