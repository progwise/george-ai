import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: AiLanguageModel Queries')

// Paginated result type for AI models
const AiLanguageModelsResult = builder
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
            enabled: true, // Always count only enabled
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
            ...(!root.showDisabled && { enabled: true }),
            ...(root.search && { name: { contains: root.search, mode: 'insensitive' as const } }),
            ...(root.providers && root.providers.length > 0 && { provider: { in: root.providers } }),
            ...(capabilityFilters.length > 0 && { OR: capabilityFilters }),
            ...(root.onlyUsed && { lastUsedAt: { not: null } }),
          }

          return prisma.aiLanguageModel.count({ where })
        },
      }),
      models: t.prismaField({
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

builder.queryField('aiLanguageModels', (t) =>
  t.withAuth({ isLoggedIn: true, admin: true }).field({
    type: AiLanguageModelsResult,
    nullable: false,
    args: {
      skip: t.arg.int({ required: false, defaultValue: 0 }),
      take: t.arg.int({ required: false, defaultValue: 20 }),
      search: t.arg.string({ required: false }),
      providers: t.arg.stringList({ required: false }),
      canDoEmbedding: t.arg.boolean({ required: false }),
      canDoChatCompletion: t.arg.boolean({ required: false }),
      canDoVision: t.arg.boolean({ required: false }),
      canDoFunctionCalling: t.arg.boolean({ required: false }),
      onlyUsed: t.arg.boolean({ required: false, defaultValue: false }),
      showDisabled: t.arg.boolean({ required: false, defaultValue: false }),
    },
    resolve: async (_parent, args) => {
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
      }
    },
  }),
)

// Usage tracking query result types
const ModelUsageStats = builder.simpleObject('ModelUsageStats', {
  fields: (t) => ({
    totalRequests: t.int({ nullable: false }),
    totalTokensInput: t.int({ nullable: false }),
    totalTokensOutput: t.int({ nullable: false }),
    totalDurationMs: t.int({ nullable: false }),
    avgTokensInput: t.float({ nullable: false }),
    avgTokensOutput: t.float({ nullable: false }),
    avgDurationMs: t.float({ nullable: false }),
  }),
})

const ModelUsageByProvider = builder.simpleObject('ModelUsageByProvider', {
  fields: (t) => ({
    provider: t.string({ nullable: false }),
    totalRequests: t.int({ nullable: false }),
    totalTokensInput: t.int({ nullable: false }),
    totalTokensOutput: t.int({ nullable: false }),
  }),
})

const ModelUsageByModel = builder.simpleObject('ModelUsageByModel', {
  fields: (t) => ({
    modelId: t.string({ nullable: false }),
    modelName: t.string({ nullable: false }),
    provider: t.string({ nullable: false }),
    totalRequests: t.int({ nullable: false }),
    totalTokensInput: t.int({ nullable: false }),
    totalTokensOutput: t.int({ nullable: false }),
  }),
})

const ModelUsageByType = builder.simpleObject('ModelUsageByType', {
  fields: (t) => ({
    usageType: t.string({ nullable: false }),
    totalRequests: t.int({ nullable: false }),
    totalTokensInput: t.int({ nullable: false }),
    totalTokensOutput: t.int({ nullable: false }),
  }),
})

// Query: Get usage statistics with filters
builder.queryField('aiModelUsageStats', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: ModelUsageStats,
    args: {
      modelId: t.arg.string({ required: false }),
      userId: t.arg.string({ required: false }),
      libraryId: t.arg.string({ required: false }),
      assistantId: t.arg.string({ required: false }),
      listId: t.arg.string({ required: false }),
      usageType: t.arg.string({ required: false }),
      startDate: t.arg({ type: 'DateTime', required: false }),
      endDate: t.arg({ type: 'DateTime', required: false }),
    },
    resolve: async (_parent, args, ctx) => {
      // Admin sees all, users see only their own usage
      const where = {
        ...(args.modelId && { modelId: args.modelId }),
        ...(args.libraryId && { libraryId: args.libraryId }),
        ...(args.assistantId && { assistantId: args.assistantId }),
        ...(args.listId && { listId: args.listId }),
        ...(args.usageType && { usageType: args.usageType }),
        ...(args.startDate || args.endDate
          ? {
              createdAt: {
                ...(args.startDate && { gte: args.startDate }),
                ...(args.endDate && { lte: args.endDate }),
              },
            }
          : {}),
        // Non-admin users can only see their own usage
        ...(!ctx.session.user.isAdmin && { userId: ctx.session.user.id }),
        // Admin can filter by specific user
        ...(ctx.session.user.isAdmin && args.userId && { userId: args.userId }),
      }

      const aggregation = await prisma.aiModelUsage.aggregate({
        where,
        _sum: {
          requestCount: true,
          tokensInput: true,
          tokensOutput: true,
          durationMs: true,
        },
        _avg: {
          tokensInput: true,
          tokensOutput: true,
          durationMs: true,
        },
      })

      return {
        totalRequests: aggregation._sum.requestCount || 0,
        totalTokensInput: aggregation._sum.tokensInput || 0,
        totalTokensOutput: aggregation._sum.tokensOutput || 0,
        totalDurationMs: aggregation._sum.durationMs || 0,
        avgTokensInput: aggregation._avg.tokensInput || 0,
        avgTokensOutput: aggregation._avg.tokensOutput || 0,
        avgDurationMs: aggregation._avg.durationMs || 0,
      }
    },
  }),
)

// Query: Usage breakdown by provider
builder.queryField('aiModelUsageByProvider', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: [ModelUsageByProvider],
    nullable: { list: false, items: false },
    args: {
      userId: t.arg.string({ required: false }),
      libraryId: t.arg.string({ required: false }),
      startDate: t.arg({ type: 'DateTime', required: false }),
      endDate: t.arg({ type: 'DateTime', required: false }),
    },
    resolve: async (_parent, args, ctx) => {
      const where = {
        ...(args.libraryId && { libraryId: args.libraryId }),
        ...(args.startDate || args.endDate
          ? {
              createdAt: {
                ...(args.startDate && { gte: args.startDate }),
                ...(args.endDate && { lte: args.endDate }),
              },
            }
          : {}),
        ...(!ctx.session.user.isAdmin && { userId: ctx.session.user.id }),
        ...(ctx.session.user.isAdmin && args.userId && { userId: args.userId }),
      }

      const results = await prisma.aiModelUsage.groupBy({
        by: ['providerName'],
        where,
        _sum: {
          requestCount: true,
          tokensInput: true,
          tokensOutput: true,
        },
        orderBy: {
          _sum: {
            requestCount: 'desc',
          },
        },
      })

      return results.map((r) => ({
        provider: r.providerName,
        totalRequests: r._sum.requestCount || 0,
        totalTokensInput: r._sum.tokensInput || 0,
        totalTokensOutput: r._sum.tokensOutput || 0,
      }))
    },
  }),
)

// Query: Usage breakdown by model
builder.queryField('aiModelUsageByModel', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: [ModelUsageByModel],
    nullable: { list: false, items: false },
    args: {
      userId: t.arg.string({ required: false }),
      libraryId: t.arg.string({ required: false }),
      provider: t.arg.string({ required: false }),
      startDate: t.arg({ type: 'DateTime', required: false }),
      endDate: t.arg({ type: 'DateTime', required: false }),
    },
    resolve: async (_parent, args, ctx) => {
      const where = {
        ...(args.libraryId && { libraryId: args.libraryId }),
        ...(args.provider && { providerName: args.provider }),
        ...(args.startDate || args.endDate
          ? {
              createdAt: {
                ...(args.startDate && { gte: args.startDate }),
                ...(args.endDate && { lte: args.endDate }),
              },
            }
          : {}),
        ...(!ctx.session.user.isAdmin && { userId: ctx.session.user.id }),
        ...(ctx.session.user.isAdmin && args.userId && { userId: args.userId }),
      }

      const results = await prisma.aiModelUsage.groupBy({
        by: ['modelId', 'modelName', 'providerName'],
        where,
        _sum: {
          requestCount: true,
          tokensInput: true,
          tokensOutput: true,
        },
        orderBy: {
          _sum: {
            requestCount: 'desc',
          },
        },
      })

      return results.map((r) => ({
        modelId: r.modelId,
        modelName: r.modelName,
        provider: r.providerName,
        totalRequests: r._sum.requestCount || 0,
        totalTokensInput: r._sum.tokensInput || 0,
        totalTokensOutput: r._sum.tokensOutput || 0,
      }))
    },
  }),
)

// Query: Usage breakdown by type (chat, embedding, vision, enrichment)
builder.queryField('aiModelUsageByType', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: [ModelUsageByType],
    nullable: { list: false, items: false },
    args: {
      userId: t.arg.string({ required: false }),
      libraryId: t.arg.string({ required: false }),
      startDate: t.arg({ type: 'DateTime', required: false }),
      endDate: t.arg({ type: 'DateTime', required: false }),
    },
    resolve: async (_parent, args, ctx) => {
      const where = {
        ...(args.libraryId && { libraryId: args.libraryId }),
        ...(args.startDate || args.endDate
          ? {
              createdAt: {
                ...(args.startDate && { gte: args.startDate }),
                ...(args.endDate && { lte: args.endDate }),
              },
            }
          : {}),
        ...(!ctx.session.user.isAdmin && { userId: ctx.session.user.id }),
        ...(ctx.session.user.isAdmin && args.userId && { userId: args.userId }),
      }

      const results = await prisma.aiModelUsage.groupBy({
        by: ['usageType'],
        where,
        _sum: {
          requestCount: true,
          tokensInput: true,
          tokensOutput: true,
        },
        orderBy: {
          _sum: {
            requestCount: 'desc',
          },
        },
      })

      return results.map((r) => ({
        usageType: r.usageType,
        totalRequests: r._sum.requestCount || 0,
        totalTokensInput: r._sum.tokensInput || 0,
        totalTokensOutput: r._sum.tokensOutput || 0,
      }))
    },
  }),
)
