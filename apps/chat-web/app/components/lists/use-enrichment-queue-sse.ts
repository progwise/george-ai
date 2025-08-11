import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'

import { dateTimeString } from '@george-ai/web-utils'

import { useTranslation } from '../../i18n/use-translation-hook'
import { queryKeys } from '../../query-keys'
import { getBackendPublicUrl } from '../../server-functions/backend'

interface ComputedValue {
  valueString?: string | null
  valueNumber?: number | null
  valueDate?: Date | null
  valueBoolean?: boolean | null
}

type QueueItemStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface EnrichmentQueueUpdate {
  queueItemId: string
  listId: string
  fieldId: string
  fileId: string
  status: QueueItemStatus
  error?: string | null
  computedValue: ComputedValue | null
}

interface ComputedValue {
  valueString?: string | null
  valueNumber?: number | null
  valueDate?: Date | null
  valueBoolean?: boolean | null
}

export const useEnrichmentQueueSSE = (
  listId: string,
  reportStatusMessage: ({ update, displayValue }: { update: EnrichmentQueueUpdate; displayValue: string }) => void,
) => {
  const { t, language } = useTranslation()
  const { data: backend_url } = useQuery({
    queryKey: [queryKeys.BackendUrl],
    queryFn: () => getBackendPublicUrl(),
    staleTime: Infinity,
  })

  const getDisplayValue = useCallback(
    (value: ComputedValue | null) => {
      if (!value) {
        return 'null'
      }
      if (value.valueBoolean !== null && value.valueBoolean !== undefined) {
        return value.valueBoolean ? t('texts.true') : t('texts.false')
      }
      if (value.valueDate) {
        return dateTimeString(value.valueDate.toISOString(), language)
      }
      if (value.valueNumber) {
        return value.valueNumber.toLocaleString()
      }
      if (value.valueString) {
        return value.valueString
      }
      return t('texts.noValue')
    },
    [language, t],
  )

  // Set up SSE connection
  useEffect(() => {
    if (!listId || !backend_url) {
      return
    }
    console.log('should only render once')
    const evtSource = new EventSource(`${backend_url}/enrichment-queue-sse?listId=${listId}`)

    const handleConnected = (event: MessageEvent) => {
      console.log('Connected to enrichment queue SSE:', event.data)
    }

    const handleEnrichmentUpdate = (event: MessageEvent) => {
      const update = JSON.parse(event.data) as EnrichmentQueueUpdate
      const displayValue = getDisplayValue(update.computedValue)
      reportStatusMessage({ update, displayValue })
    }

    const handleError = (error: Event) => {
      console.error('Enrichment queue SSE error:', error)
    }

    evtSource.addEventListener('connected', handleConnected)
    evtSource.addEventListener('enrichment-update', handleEnrichmentUpdate)
    evtSource.onerror = handleError

    return () => {
      evtSource.removeEventListener('connected', handleConnected)
      evtSource.removeEventListener('enrichment-update', handleEnrichmentUpdate)
      evtSource.onerror = null
      evtSource.close()
    }
  }, [listId, backend_url, reportStatusMessage, getDisplayValue])
}
