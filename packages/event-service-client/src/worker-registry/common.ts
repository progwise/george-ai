import { createLogger } from '@george-ai/app-commons'

import { WorkerType } from './schema'

export const logger = createLogger('event-service-client:worker-registry')
export const WORKER_REGISTRY_BUCKET_NAME = 'worker-registry'

export const getKeyFilter = ({ workerType, workerId }: { workerType?: WorkerType; workerId?: string }) =>
  `worker.${workerId ?? '*'}.${workerType ?? '*'}`

export const getKey = (args: { workerId: string; workerType: WorkerType }) =>
  `worker.${args.workerId}.${args.workerType}`

export const getWorkerTypeFromKey = (key: string): WorkerType => {
  const parts = key.split('.')
  if (parts.length !== 3) {
    throw new Error(`Invalid worker registry key: ${key}`)
  }
  return parts[2] as WorkerType
}

export const getWorkerIdFromKey = (key: string): string => {
  const parts = key.split('.')
  if (parts.length !== 3) {
    throw new Error(`Invalid worker registry key: ${key}`)
  }
  return parts[1]
}
