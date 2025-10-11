import { useTranslation } from '../../i18n/use-translation-hook'
import { PlayIcon } from '../../icons/play-icon'
import { SparklesIcon } from '../../icons/sparkles-icon'
import { StopIcon } from '../../icons/stop-icon'
import { useEnrichmentActions } from './use-enrichment-actions'
import { useListSettings } from './use-list-settings'

interface EnrichmentControlsProps {
  listId: string
  fieldId: string
  isProcessing: boolean
}

export const EnrichmentControls = ({ listId, fieldId, isProcessing }: EnrichmentControlsProps) => {
  const { t } = useTranslation()

  const { filters } = useListSettings(listId)
  const {
    startEnrichment,
    stopEnrichments,
    clearEnrichments,
    isPending: enrichmentActionsIsPending,
  } = useEnrichmentActions(listId)

  const handleStartEnrichment = () => {
    startEnrichment({ fieldId, onlyMissingValues: true, filters })
  }

  const handleStopEnrichment = () => {
    stopEnrichments({ fieldId })
  }

  const handleCleanEnrichments = () => {
    clearEnrichments({ fieldId })
  }

  return (
    <>
      {!isProcessing ? (
        <button
          type="button"
          className="hover:bg-base-200 flex w-full items-center px-4 py-2 text-sm transition-colors"
          onClick={handleStartEnrichment}
          disabled={enrichmentActionsIsPending}
        >
          <PlayIcon className="mr-2" />
          {t('lists.enrichment.start')}
        </button>
      ) : (
        <button
          type="button"
          className="hover:bg-base-200 flex w-full items-center px-4 py-2 text-sm transition-colors"
          onClick={handleStopEnrichment}
          disabled={enrichmentActionsIsPending}
        >
          <StopIcon className="mr-2" />
          {t('lists.enrichment.stop')}
        </button>
      )}

      <button
        type="button"
        className="hover:bg-base-200 flex w-full items-center px-4 py-2 text-sm transition-colors"
        onClick={handleCleanEnrichments}
        disabled={enrichmentActionsIsPending}
      >
        <SparklesIcon className="mr-2" />
        {t('lists.enrichment.clean')}
      </button>
    </>
  )
}
