export const MODEL_PROVIDERS = ['openai', 'ollama'] as const
export type ModelProvider = (typeof MODEL_PROVIDERS)[number]
