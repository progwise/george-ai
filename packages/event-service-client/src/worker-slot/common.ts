import { createLogger } from '@george-ai/app-commons'
import { WorkerRole, WorkerRoleSchema } from '@george-ai/app-schema'

export const logger = createLogger('event-service-client:worker-slot')
export const WORKER_SLOT_BUCKET_NAME = 'worker-slot'

export const getWorkerSlotKey = (args: { workerId: string; role: WorkerRole }) =>
  `role.${args.role}.worker-id.${args.workerId}`

export const getWorkerSlotKeyFilter = ({ role, workerId }: { role?: WorkerRole; workerId?: string }) =>
  `role.${role ?? '*'}.worker-id.${workerId ?? '*'}`

export const parseWorkerSlotKey = (key: string): { role: WorkerRole; workerId: string } | null => {
  const parts = key.split('.')
  if (parts.length !== 4) {
    logger.warn('Unexpected worker slot key format', { key })
    return null
  }
  const parseResult = WorkerRoleSchema.safeParse(parts[1])
  if (parseResult.error) {
    logger.warn('cannot parse parts as WorkerRole', { WORKER_SLOT_BUCKET_NAME, key, error: parseResult.error })
    return null
  }
  return { role: WorkerRoleSchema.parse(parts[1]), workerId: parts[3] }
}
