import { useSuspenseQuery } from '@tanstack/react-query'

import { ActionType, EventProcessingStatus } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { PlayIcon } from '../../../icons/play-icon'
import { StopIcon } from '../../../icons/stop-icon'
import { getEventProcessingStatusQueryOptions } from '../../workspace/queries/get-processing-status'
import { useWorkerActions } from './use-worker-actions'

export const ManageWorkersMenu = () => {
  const { t } = useTranslation()

  const { data: eventProcessingStatus } = useSuspenseQuery(getEventProcessingStatusQueryOptions())

  const { stopProcessing, startProcessing, pending } = useWorkerActions()

  const isProcessing = (actionType: ActionType) => {
    const processingStatus = eventProcessingStatus.find((status) => status.actionType === actionType)
    return processingStatus?.status === EventProcessingStatus.Running
  }

  return (
    <ul className="menu menu-horizontal gap-2 rounded-box bg-base-200/50 p-2">
      <li aria-disabled={pending}>
        {!isProcessing(ActionType.EmbedFile) ? (
          <a
            className="btn btn-xs btn-primary"
            onClick={() => startProcessing({ data: { actionType: ActionType.EmbedFile } })}
          >
            <PlayIcon className="size-4" />
            {t('admin.workers.startEmbedding')}
          </a>
        ) : (
          <a
            className="btn btn-xs btn-secondary"
            onClick={() => stopProcessing({ data: { actionType: ActionType.EmbedFile } })}
          >
            <StopIcon className="size-4" />
            {t('admin.workers.stopEmbedding')}
          </a>
        )}
      </li>
      <li>
        {!isProcessing(ActionType.ExtractFile) ? (
          <a
            className="btn btn-xs btn-primary"
            onClick={() => startProcessing({ data: { actionType: ActionType.ExtractFile } })}
          >
            <PlayIcon className="size-4" />
            {t('admin.workers.startExtraction')}
          </a>
        ) : (
          <a
            aria-disabled={pending}
            className="btn btn-xs btn-secondary"
            onClick={() => stopProcessing({ data: { actionType: ActionType.ExtractFile } })}
          >
            <StopIcon className="size-4" />
            {t('admin.workers.stopExtraction')}
          </a>
        )}
      </li>
    </ul>
  )
}
