export const WORKER_TYPES = [
  'WORKER_REGISTRY',
  'AI_HEALTH_MANAGEMENT',
  'WORKSPACE_PROCESSING',
  'AI_PROVIDER_CALLING',
] as const
export type WorkerType = (typeof WORKER_TYPES)[number]
