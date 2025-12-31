import type { WorkspaceProviderConfigEvent } from '@george-ai/events'
import { workspace } from '@george-ai/events'

import { eventClient } from './event-client'

interface ProviderInfo {
  providerId: string
  providerType: 'ollama' | 'openai' | 'anthropic'
  baseUrl: string
  apiKey?: string
  enabled: boolean
  models: Array<{
    id: string
    name: string
    capabilities: string[]
  }>
}

// Cache provider configs per workspace
const providerCache = new Map<string, ProviderInfo[]>()

export async function initProviderConfigSubscription(workspaceId: string): Promise<() => Promise<void>> {
  console.log(`Subscribing to provider config events for workspace ${workspaceId}`)

  const cleanup = await workspace.subscribeProviderConfigEvents(eventClient, {
    subscriptionName: `ai-service-worker-provider-config-${workspaceId}`,
    workspaceId,
    handler: async (event: WorkspaceProviderConfigEvent) => {
      providerCache.set(workspaceId, event.providers)
      console.log(`Updated provider config for workspace ${workspaceId}: ${event.providers.length} providers`)
    },
  })

  return cleanup
}

export function getProviderForModel(modelName: string, workspaceId: string): ProviderInfo | null {
  const providers = providerCache.get(workspaceId)
  if (!providers) {
    console.warn(`No provider config cached for workspace ${workspaceId}`)
    return null
  }

  // Find provider that has this model
  for (const provider of providers) {
    if (!provider.enabled) continue

    const hasModel = provider.models.some((m) => m.name === modelName || m.id === modelName)
    if (hasModel) {
      return provider
    }
  }

  console.warn(`No provider found for model ${modelName} in workspace ${workspaceId}`)
  return null
}

export function getProviderConfig(workspaceId: string): ProviderInfo[] | undefined {
  return providerCache.get(workspaceId)
}
