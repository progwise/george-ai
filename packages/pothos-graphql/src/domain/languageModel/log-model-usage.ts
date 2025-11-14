import { prisma } from '../../prisma'

export interface ModelUsageContext {
  modelId: string
  userId?: string
  libraryId?: string
  assistantId?: string
  listId?: string
  usageType: 'chat' | 'embedding' | 'vision' | 'enrichment'
  tokensInput?: number
  tokensOutput?: number
  durationMs: number
}

/**
 * Logs AI model usage for billing/analytics
 *
 * - Atomic transaction: creates usage log + updates model.lastUsedAt
 * - Denormalizes provider/model name to preserve historical data
 * - Non-throwing: logging failures don't break user operations
 *
 * @param context Usage context with model, user, and metrics
 */
export async function logModelUsage(context: ModelUsageContext): Promise<void> {
  try {
    // Get model info for denormalization
    const model = await prisma.aiLanguageModel.findUnique({
      where: { id: context.modelId },
      select: { provider: true, name: true },
    })

    if (!model) {
      console.warn(`Model ${context.modelId} not found for usage logging`)
      return
    }

    // Atomic transaction: create usage log + update lastUsedAt
    await prisma.$transaction([
      prisma.aiModelUsage.create({
        data: {
          modelId: context.modelId,
          providerName: model.provider,
          modelName: model.name,
          userId: context.userId,
          libraryId: context.libraryId,
          assistantId: context.assistantId,
          listId: context.listId,
          usageType: context.usageType,
          tokensInput: context.tokensInput,
          tokensOutput: context.tokensOutput,
          durationMs: context.durationMs,
          requestCount: 1,
        },
      }),
      prisma.aiLanguageModel.update({
        where: { id: context.modelId },
        data: { lastUsedAt: new Date() },
      }),
    ])
  } catch (error) {
    console.error('Usage tracking failed:', error)
    // Don't throw - logging failures shouldn't break user operations
  }
}
