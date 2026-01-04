import { admin } from '@george-ai/events'

import { eventClient } from './event-client'
import { prisma } from './prisma'

export const initializeAppDomain = async () => {
  const workspaces = await prisma.workspace.findMany({
    select: {
      id: true,
      name: true,
      aiProviders: { where: { enabled: true } },
      languageModels: { where: { enabled: true } },
    },
  })
  for (const workspace of workspaces) {
    // Initialize any workspace-specific domain logic here
    console.log(`Initializing domain for workspace: ${workspace.id}`)
    await admin.publishWorkspaceStartup(eventClient, {
      workspaceId: workspace.id,
      providers: workspace.aiProviders.map((provider) => ({
        id: provider.id,
        name: provider.name,
        baseUrl: provider.baseUrl || undefined,
        apiKey: provider.apiKey || undefined,
      })),
      languageModels: workspace.languageModels.map((model) => ({
        id: model.id,
        name: model.name,
        provider: model.provider,
        canDoEmbedding: model.canDoEmbedding,
        canDoChatCompletion: model.canDoChatCompletion,
        canDoVision: model.canDoVision,
        canDoFunctionCalling: model.canDoFunctionCalling,
      })),
    })
  }
}
