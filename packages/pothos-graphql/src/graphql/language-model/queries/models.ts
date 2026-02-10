import { prisma } from '@george-ai/app-database'
import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'

// Type for provider capability counts
const ProviderCapabilityCounts = builder.simpleObject('ProviderCapabilityCounts', {
  fields: (t) => ({
    provider: t.string({ nullable: false }),
    modelCount: t.int({ nullable: false }),
    enabledCount: t.int({ nullable: false }),
    disabledCount: t.int({ nullable: false }),
    embeddingCount: t.int({ nullable: false }),
    chatCount: t.int({ nullable: false }),
    visionCount: t.int({ nullable: false }),
    functionCount: t.int({ nullable: false }),
  }),
})

// Paginated result type for AI models
const result = builder
  .objectRef<{
    take: number
    skip: number
    search?: string
    providers?: string[]
    canDoEmbedding?: boolean
    canDoChatCompletion?: boolean
    canDoVision?: boolean
    canDoFunctionCalling?: boolean
    onlyUsed: boolean
    showDisabled: boolean
    workspaceId?: string
  }>('AiLanguageModelsResult')
  .implement({
    description: 'Paginated result for AI Language Models',
    fields: (t) => ({
      take: t.exposeInt('take', { nullable: false }),
      skip: t.exposeInt('skip', { nullable: false }),
      enabledCount: t.field({
        type: 'Int',
        nullable: false,
        resolve: async (root) => {
          const capabilityFilters = []
          if (root.canDoEmbedding !== undefined && root.canDoEmbedding !== null) {
            capabilityFilters.push({ canDoEmbedding: root.canDoEmbedding })
          }
          if (root.canDoChatCompletion !== undefined && root.canDoChatCompletion !== null) {
            capabilityFilters.push({ canDoChatCompletion: root.canDoChatCompletion })
          }
          if (root.canDoVision !== undefined && root.canDoVision !== null) {
            capabilityFilters.push({ canDoVision: root.canDoVision })
          }
          if (root.canDoFunctionCalling !== undefined && root.canDoFunctionCalling !== null) {
            capabilityFilters.push({ canDoFunctionCalling: root.canDoFunctionCalling })
          }

          const where = {
            workspaceId: root.workspaceId,
            enabled: true, // Always count only enabled
            ...(root.search && { name: { contains: root.search, mode: 'insensitive' as const } }),
            ...(root.providers && root.providers.length > 0 && { provider: { in: root.providers } }),
            ...(capabilityFilters.length > 0 && { OR: capabilityFilters }),
            ...(root.onlyUsed && { lastUsedAt: { not: null } }),
          }

          return prisma.aiLanguageModel.count({ where })
        },
      }),
      disabledCount: t.field({
        type: 'Int',
        nullable: false,
        resolve: async (root) => {
          const capabilityFilters = []
          if (root.canDoEmbedding !== undefined && root.canDoEmbedding !== null) {
            capabilityFilters.push({ canDoEmbedding: root.canDoEmbedding })
          }
          if (root.canDoChatCompletion !== undefined && root.canDoChatCompletion !== null) {
            capabilityFilters.push({ canDoChatCompletion: root.canDoChatCompletion })
          }
          if (root.canDoVision !== undefined && root.canDoVision !== null) {
            capabilityFilters.push({ canDoVision: root.canDoVision })
          }
          if (root.canDoFunctionCalling !== undefined && root.canDoFunctionCalling !== null) {
            capabilityFilters.push({ canDoFunctionCalling: root.canDoFunctionCalling })
          }

          const where = {
            workspaceId: root.workspaceId,
            enabled: false, // Only count disabled models
            ...(root.search && { name: { contains: root.search, mode: 'insensitive' as const } }),
            ...(root.providers && root.providers.length > 0 && { provider: { in: root.providers } }),
            ...(capabilityFilters.length > 0 && { OR: capabilityFilters }),
            ...(root.onlyUsed && { lastUsedAt: { not: null } }),
          }

          return prisma.aiLanguageModel.count({ where })
        },
      }),
      embeddingCount: t.field({
        type: 'Int',
        nullable: false,
        resolve: async (root) => {
          const where = {
            workspaceId: root.workspaceId,
            ...(!root.showDisabled && { enabled: true }),
            ...(root.search && { name: { contains: root.search, mode: 'insensitive' as const } }),
            ...(root.providers && root.providers.length > 0 && { provider: { in: root.providers } }),
            canDoEmbedding: true, // Always filter for embedding capability
            ...(root.onlyUsed && { lastUsedAt: { not: null } }),
          }

          return prisma.aiLanguageModel.count({ where })
        },
      }),
      providerCount: t.field({
        type: 'Int',
        nullable: false,
        resolve: async (root) => {
          const capabilityFilters = []
          if (root.canDoEmbedding !== undefined && root.canDoEmbedding !== null) {
            capabilityFilters.push({ canDoEmbedding: root.canDoEmbedding })
          }
          if (root.canDoChatCompletion !== undefined && root.canDoChatCompletion !== null) {
            capabilityFilters.push({ canDoChatCompletion: root.canDoChatCompletion })
          }
          if (root.canDoVision !== undefined && root.canDoVision !== null) {
            capabilityFilters.push({ canDoVision: root.canDoVision })
          }
          if (root.canDoFunctionCalling !== undefined && root.canDoFunctionCalling !== null) {
            capabilityFilters.push({ canDoFunctionCalling: root.canDoFunctionCalling })
          }

          const where = {
            workspaceId: root.workspaceId,
            ...(!root.showDisabled && { enabled: true }),
            ...(root.search && { name: { contains: root.search, mode: 'insensitive' as const } }),
            ...(root.providers && root.providers.length > 0 && { provider: { in: root.providers } }),
            ...(capabilityFilters.length > 0 && { OR: capabilityFilters }),
            ...(root.onlyUsed && { lastUsedAt: { not: null } }),
          }

          // Get distinct providers
          const providers = await prisma.aiLanguageModel.findMany({
            where,
            select: { provider: true },
            distinct: ['provider'],
          })

          return providers.length
        },
      }),
      count: t.field({
        type: 'Int',
        nullable: false,
        resolve: async (root) => {
          // Build OR array for capabilities
          const capabilityFilters = []
          if (root.canDoEmbedding !== undefined && root.canDoEmbedding !== null) {
            capabilityFilters.push({ canDoEmbedding: root.canDoEmbedding })
          }
          if (root.canDoChatCompletion !== undefined && root.canDoChatCompletion !== null) {
            capabilityFilters.push({ canDoChatCompletion: root.canDoChatCompletion })
          }
          if (root.canDoVision !== undefined && root.canDoVision !== null) {
            capabilityFilters.push({ canDoVision: root.canDoVision })
          }
          if (root.canDoFunctionCalling !== undefined && root.canDoFunctionCalling !== null) {
            capabilityFilters.push({ canDoFunctionCalling: root.canDoFunctionCalling })
          }

          const where = {
            workspaceId: root.workspaceId,
            ...(!root.showDisabled && { enabled: true }),
            ...(root.search && { name: { contains: root.search, mode: 'insensitive' as const } }),
            ...(root.providers && root.providers.length > 0 && { provider: { in: root.providers } }),
            ...(capabilityFilters.length > 0 && { OR: capabilityFilters }),
            ...(root.onlyUsed && { lastUsedAt: { not: null } }),
          }

          return prisma.aiLanguageModel.count({ where })
        },
      }),
      providerCapabilities: t.field({
        type: [ProviderCapabilityCounts],
        nullable: { list: false, items: false },
        resolve: async (root) => {
          const baseWhere = {
            workspaceId: root.workspaceId,
            ...(!root.showDisabled && { enabled: true }),
            ...(root.search && { name: { contains: root.search, mode: 'insensitive' as const } }),
            ...(root.onlyUsed && { lastUsedAt: { not: null } }),
            ...(root.providers && root.providers.length > 0 && { provider: { in: root.providers } }),
          }

          // Get all distinct providers (or use provided filter)
          const providers = root.providers && root.providers.length > 0 ? root.providers : ['ollama', 'openai']

          // For each provider, count models by capability
          const results = await Promise.all(
            providers.map(async (provider) => {
              const providerWhere = { ...baseWhere, provider }

              const [modelCount, enabledCount, disabledCount, embeddingCount, chatCount, visionCount, functionCount] =
                await Promise.all([
                  prisma.aiLanguageModel.count({ where: { ...providerWhere } }),
                  prisma.aiLanguageModel.count({ where: { ...providerWhere, enabled: true } }),
                  prisma.aiLanguageModel.count({ where: { ...providerWhere, enabled: false } }),
                  prisma.aiLanguageModel.count({ where: { ...providerWhere, canDoEmbedding: true } }),
                  prisma.aiLanguageModel.count({ where: { ...providerWhere, canDoChatCompletion: true } }),
                  prisma.aiLanguageModel.count({ where: { ...providerWhere, canDoVision: true } }),
                  prisma.aiLanguageModel.count({ where: { ...providerWhere, canDoFunctionCalling: true } }),
                ])

              return {
                provider,
                modelCount,
                enabledCount,
                disabledCount,
                embeddingCount,
                chatCount,
                visionCount,
                functionCount,
              }
            }),
          )

          return results
        },
      }),
      items: t.prismaField({
        type: ['AiLanguageModel'],
        nullable: { list: false, items: false },
        resolve: async (query, root) => {
          // Build OR array for capabilities
          const capabilityFilters = []
          if (root.canDoEmbedding !== undefined && root.canDoEmbedding !== null) {
            capabilityFilters.push({ canDoEmbedding: root.canDoEmbedding })
          }
          if (root.canDoChatCompletion !== undefined && root.canDoChatCompletion !== null) {
            capabilityFilters.push({ canDoChatCompletion: root.canDoChatCompletion })
          }
          if (root.canDoVision !== undefined && root.canDoVision !== null) {
            capabilityFilters.push({ canDoVision: root.canDoVision })
          }
          if (root.canDoFunctionCalling !== undefined && root.canDoFunctionCalling !== null) {
            capabilityFilters.push({ canDoFunctionCalling: root.canDoFunctionCalling })
          }

          const where = {
            workspaceId: root.workspaceId,
            ...(!root.showDisabled && { enabled: true }),
            ...(root.search && { name: { contains: root.search, mode: 'insensitive' as const } }),
            ...(root.providers && root.providers.length > 0 && { provider: { in: root.providers } }),
            ...(capabilityFilters.length > 0 && { OR: capabilityFilters }),
            ...(root.onlyUsed && { lastUsedAt: { not: null } }),
          }

          return prisma.aiLanguageModel.findMany({
            ...query,
            where,
            skip: root.skip ?? 0,
            take: root.take ?? 20,
            orderBy: [{ provider: 'asc' }, { name: 'asc' }],
            include: {
              librariesUsingForEmbedding: {
                select: { id: true, name: true },
              },
              assistantsUsing: {
                select: { id: true, name: true },
              },
              listFieldsUsing: {
                select: { id: true, list: { select: { id: true, name: true } } },
              },
            },
          })
        },
      }),
    }),
  })

builder.queryField('models', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: result,
    nullable: false,
    args: {
      skip: t.arg.int({ required: false, defaultValue: 0 }),
      take: t.arg.int({ required: false, defaultValue: 20 }),
      search: t.arg.string({ required: false }),
      providers: t.arg({ type: ['ModelProvider'], required: false }),
      canDoEmbedding: t.arg.boolean({ required: false }),
      canDoChatCompletion: t.arg.boolean({ required: false }),
      canDoVision: t.arg.boolean({ required: false }),
      canDoFunctionCalling: t.arg.boolean({ required: false }),
      onlyUsed: t.arg.boolean({ required: false, defaultValue: false }),
      showDisabled: t.arg.boolean({ required: false, defaultValue: false }),
    },
    resolve: async (_parent, args, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)

      return {
        take: args.take ?? 20,
        skip: args.skip ?? 0,
        search: args.search ?? undefined,
        providers: args.providers ?? undefined,
        canDoEmbedding: args.canDoEmbedding ?? undefined,
        canDoChatCompletion: args.canDoChatCompletion ?? undefined,
        canDoVision: args.canDoVision ?? undefined,
        canDoFunctionCalling: args.canDoFunctionCalling ?? undefined,
        onlyUsed: args.onlyUsed ?? false,
        showDisabled: args.showDisabled ?? false,
        workspaceId,
      }
    },
  }),
)
