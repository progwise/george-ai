import { builder } from '../builder'

export const WorkspaceEventMessageStatisticValues = builder.simpleObject('WorkspaceEventMessageStatisticValues', {
  fields: (t) => ({
    processType: t.field({ type: 'ProcessType', nullable: false }),
    totalMessages: t.int({ nullable: false }),
    processedMessages: t.int({ nullable: false }),
    pendingMessages: t.int({ nullable: false }),
  }),
})

export const WorkspaceStatistics = builder.simpleObject('WorkspaceWorkerStatistics', {
  fields: (t) => ({
    workspaceId: t.string({ nullable: false }),
    statistics: t.field({
      type: [WorkspaceEventMessageStatisticValues],
      nullable: false,
    }),
  }),
})

export const WorkspaceWorker = builder.simpleObject('WorkspaceWorker', {
  fields: (t) => ({
    workerId: t.string({ nullable: false }),
    workerType: t.field({ type: 'WorkerType', nullable: false }),
    healthy: t.boolean({ nullable: false }),
    lastHeartbeatAt: t.string({ nullable: false }),
  }),
})
