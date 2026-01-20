import { WorkspaceProcessingType } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { PlayIcon } from '../../../icons/play-icon'
import { StopIcon } from '../../../icons/stop-icon'
import { useWorkerActions } from './use-worker-actions'

export const ManageWorkersMenu = () => {
  const { t } = useTranslation()

  const { stopProcessing, startProcessing, isProcessing, pending } = useWorkerActions()

  return (
    <ul className="menu menu-horizontal gap-2 rounded-box bg-base-200/50 p-2">
      <li aria-disabled={pending}>
        {!isProcessing(WorkspaceProcessingType.Embedding) ? (
          <a
            className="btn btn-xs btn-primary"
            onClick={() => startProcessing({ data: { processingType: WorkspaceProcessingType.Embedding } })}
          >
            <PlayIcon className="size-4" />
            {t('admin.workers.startEmbedding')}
          </a>
        ) : (
          <a
            className="btn btn-xs btn-secondary"
            onClick={() => stopProcessing({ data: { processingType: WorkspaceProcessingType.Embedding } })}
          >
            <StopIcon className="size-4" />
            {t('admin.workers.stopEmbedding')}
          </a>
        )}
      </li>
      <li>
        {!isProcessing(WorkspaceProcessingType.ContentExtraction) ? (
          <a
            className="btn btn-xs btn-primary"
            onClick={() => startProcessing({ data: { processingType: WorkspaceProcessingType.ContentExtraction } })}
          >
            <PlayIcon className="size-4" />
            {t('admin.workers.startExtraction')}
          </a>
        ) : (
          <a
            aria-disabled={pending}
            className="btn btn-xs btn-secondary"
            onClick={() => stopProcessing({ data: { processingType: WorkspaceProcessingType.ContentExtraction } })}
          >
            <StopIcon className="size-4" />
            {t('admin.workers.stopExtraction')}
          </a>
        )}
      </li>
    </ul>
  )
}
