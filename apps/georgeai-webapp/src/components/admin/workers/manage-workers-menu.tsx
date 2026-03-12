import { useSuspenseQuery } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'

import { EventQueueAction, EventQueueStatus } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { PlayIcon } from '../../../icons/play-icon'
import { StopIcon } from '../../../icons/stop-icon'
import { getEventProcessingStatusQueryOptions } from '../../workspace/queries/get-processing-status'
import { useWorkerActions } from './use-worker-actions'

export const ManageWorkersMenu = () => {
  const { t } = useTranslation()
  const { user } = useRouteContext({ from: '/_authenticated' })

  const { data: eventProcessingStatus } = useSuspenseQuery(
    getEventProcessingStatusQueryOptions({ workspaceId: user.selectedWorkspaceId }),
  )

  const { stopProcessing, startProcessing, pending } = useWorkerActions()

  const isProcessing = (action: EventQueueAction) => {
    const processingStatus = eventProcessingStatus.find((queue) => queue.action === action)
    return processingStatus?.status === EventQueueStatus.Running
  }

  return (
    <ul className="menu menu-horizontal gap-2 rounded-box bg-base-200/50 p-2">
      <li aria-disabled={pending}>
        {!isProcessing(EventQueueAction.DocumentVectorization) ? (
          <button
            type="button"
            disabled={pending}
            className="btn btn-xs btn-primary"
            onClick={() => startProcessing(EventQueueAction.DocumentVectorization)}
          >
            <PlayIcon className="size-4" />
            {t('admin.workers.startEmbedding')}
          </button>
        ) : (
          <button
            type="button"
            disabled={pending}
            className="btn btn-xs btn-secondary"
            onClick={() => stopProcessing(EventQueueAction.DocumentVectorization)}
          >
            <StopIcon className="size-4" />
            {t('admin.workers.stopEmbedding')}
          </button>
        )}
      </li>
      <li>
        {!isProcessing(EventQueueAction.DocumentExtraction) ? (
          <button
            type="button"
            disabled={pending}
            className="btn btn-xs btn-primary"
            onClick={() => startProcessing(EventQueueAction.DocumentExtraction)}
          >
            <PlayIcon className="size-4" />
            {t('admin.workers.startExtraction')}
          </button>
        ) : (
          <button
            type="button"
            disabled={pending}
            className="btn btn-xs btn-secondary"
            onClick={() => stopProcessing(EventQueueAction.DocumentExtraction)}
          >
            <StopIcon className="size-4" />
            {t('admin.workers.stopExtraction')}
          </button>
        )}
      </li>
    </ul>
  )
}
