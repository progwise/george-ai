import { GraphQLError } from 'graphql'

/**
 * Type guard that asserts a model ID is configured (not null/undefined)
 *
 * Throws user-friendly GraphQL error if model is not configured.
 * Use this to validate model configuration before AI operations.
 *
 * @param modelId The model ID to check
 * @param context Context for error message (e.g., "library", "assistant")
 * @throws GraphQLError with code MODEL_NOT_CONFIGURED if model is null/undefined
 */
export function assertModelConfigured(modelId: string | null | undefined, context: string): asserts modelId is string {
  if (!modelId) {
    throw new GraphQLError(`No AI model configured for this ${context}. Please configure a model in settings.`, {
      extensions: {
        code: 'MODEL_NOT_CONFIGURED',
        context,
      },
    })
  }
}
