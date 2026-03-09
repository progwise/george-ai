import z from 'zod'

export const WORKER_ROLES = [
  'workerSlotManager',
  'workspaceConfigManager',
  'workspaceProcessing',
  'requestFulfillment',
  'inferenceHostManager',
] as const
export type WorkerRole = (typeof WORKER_ROLES)[number]
export const WorkerRoleSchema = z.enum(WORKER_ROLES)

export const WORKER_ACTION_RESULTS = ['start', 'success', 'failure'] as const
export type WorkerActionResult = (typeof WORKER_ACTION_RESULTS)[number]
export const WorkerActionResultSchema = z.enum(WORKER_ACTION_RESULTS)
