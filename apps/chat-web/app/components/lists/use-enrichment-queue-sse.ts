import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'

import { dateTimeString } from '@george-ai/web-utils'

import { useTranslation } from '../../i18n/use-translation-hook'
import { queryKeys } from '../../query-keys'
import { getBackendPublicUrl } from '../../server-functions/backend'

// EventSource polyfill that supports credentials
class EventSourcePolyfill extends EventTarget {
  private controller: AbortController
  public url: string
  public readyState: number
  public onopen: ((event: Event) => void) | null = null
  public onmessage: ((event: MessageEvent) => void) | null = null
  public onerror: ((event: Event) => void) | null = null

  constructor(url: string, options: { withCredentials?: boolean } = {}) {
    super()
    this.url = url
    this.readyState = 0 // CONNECTING
    this.controller = new AbortController()

    this.connect(options)
  }

  private async connect(options: { withCredentials?: boolean }) {
    try {
      this.readyState = 0 // CONNECTING

      const response = await fetch(this.url, {
        credentials: options.withCredentials ? 'include' : 'omit',
        signal: this.controller.signal,
        headers: {
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      this.readyState = 1 // OPEN
      this.onopen?.(new Event('open'))
      this.dispatchEvent(new Event('open'))

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No response body')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        let eventType = 'message'
        let data = ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            data = line.slice(6)
          } else if (line.startsWith('event: ')) {
            eventType = line.slice(7)
          } else if (line === '' && data) {
            // Empty line signals end of event
            const event = new MessageEvent(eventType, { data })
            if (eventType === 'message') {
              this.onmessage?.(event)
            }
            this.dispatchEvent(event)
            // Reset for next event
            eventType = 'message'
            data = ''
          }
        }
      }
    } catch (error) {
      console.error('EventSource error:', error)
      this.readyState = 2 // CLOSED
      const errorEvent = new Event('error')
      this.onerror?.(errorEvent)
      this.dispatchEvent(errorEvent)
    }
  }

  close() {
    this.controller.abort()
    this.readyState = 2 // CLOSED
  }
}

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
    console.log('Establishing SSE connection for list:', listId)

    // Use fetch-based polyfill for EventSource with credentials support
    const evtSource = new EventSourcePolyfill(`${backend_url}/enrichment-queue-sse?listId=${listId}`, {
      withCredentials: true,
    })

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
