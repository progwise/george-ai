export const PROVIDERS = ['openai', 'ollama'] as const
export type Provider = (typeof PROVIDERS)[number]
