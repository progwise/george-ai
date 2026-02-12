import { useSuspenseQuery } from '@tanstack/react-query'

import { ProcessingRequestType } from '@george-ai/app-commons'

import { EventProcessingStatus } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { PlayIcon } from '../../../icons/play-icon'
import { StopIcon } from '../../../icons/stop-icon'
import { getEventProcessingStatusQueryOptions } from '../../workspace/queries/get-processing-status'
import { useWorkerActions } from './use-worker-actions'

export const ManageWorkersMenu = () => {
  const { t } = useTranslation()

  const { data: eventProcessingStatus } = useSuspenseQuery(getEventProcessingStatusQueryOptions())

  const { stopProcessing, startProcessing, pending } = useWorkerActions()

  const isProcessing = (requestType: ProcessingRequestType) => {
    const processingStatus = eventProcessingStatus.find((status) => status.requestType === requestType)
    return processingStatus?.status === EventProcessingStatus.Running
  }

  return (
    <ul className="menu menu-horizontal gap-2 rounded-box bg-base-200/50 p-2">
      <li aria-disabled={pending}>
        {!isProcessing('embedFile') ? (
          <button
            type="button"
            disabled={pending}
            className="btn btn-xs btn-primary"
            onClick={() => startProcessing('embedFile')}
          >
            <PlayIcon className="size-4" />
            {t('admin.workers.startEmbedding')}
          </button>
        ) : (
          <button
            type="button"
            disabled={pending}
            className="btn btn-xs btn-secondary"
            onClick={() => stopProcessing('embedFile')}
          >
            <StopIcon className="size-4" />
            {t('admin.workers.stopEmbedding')}
          </button>
        )}
      </li>
      <li>
        {!isProcessing('extractFile') ? (
          <button
            type="button"
            disabled={pending}
            className="btn btn-xs btn-primary"
            onClick={() => startProcessing('extractFile')}
          >
            <PlayIcon className="size-4" />
            {t('admin.workers.startExtraction')}
          </button>
        ) : (
          <button
            type="button"
            disabled={pending}
            className="btn btn-xs btn-secondary"
            onClick={() => stopProcessing('extractFile')}
          >
            <StopIcon className="size-4" />
            {t('admin.workers.stopExtraction')}
          </button>
        )}
      </li>
    </ul>
  )
}
