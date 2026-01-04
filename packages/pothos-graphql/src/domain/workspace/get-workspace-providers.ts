import type { ServiceProviderConfig, ServiceProviderType } from '@george-ai/ai-service-client'
import { prisma } from '@george-ai/app-domain'

/**
 * Load workspace providers from database for provider cache
 * Used by ai-service-client workspace cache
 */
export const getWorkspaceProviders = async (workspaceId: string): Promise<ServiceProviderConfig[]> => {
  const providers = await prisma.aiServiceProvider.findMany({
    where: {
      workspaceId,
      enabled: true, // Only load enabled providers
    },
    select: {
      provider: true,
      name: true,
      baseUrl: true,
      apiKey: true,
      vramGb: true,
    },
  })

  // Group providers by type (ollama vs openai)
  const grouped = new Map<ServiceProviderType, ServiceProviderConfig['endpoints']>()

  for (const provider of providers) {
    const providerType = provider.provider as ServiceProviderType
    if (!grouped.has(providerType)) {
      grouped.set(providerType, [])
    }

    grouped.get(providerType)!.push({
      name: provider.name,
      url: provider.baseUrl || undefined,
      apiKey: provider.apiKey || undefined,
      vramGB: provider.vramGb || 16, // Default 16GB if not specified
    })
  }

  // Convert grouped map to ServiceProviderConfig array
  return Array.from(grouped.entries()).map(([provider, endpoints]) => ({
    workspaceId,
    provider,
    endpoints,
  }))
}
