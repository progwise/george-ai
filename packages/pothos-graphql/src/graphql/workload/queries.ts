import { workerRegistry, workspaceProcessing } from '@george-ai/event-service-client'

import { builder } from '../builder'
import { canReadWorkspaceOrThrow } from '../workspace'
import { WorkspaceStatistics, WorkspaceWorker } from './types'

builder.queryField('workspaceStatistics', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: WorkspaceStatistics,
    nullable: false,
    resolve: async (_root, _args, context) => {
      const workspaceId = context.workspaceId
      await canReadWorkspaceOrThrow(workspaceId, context.session.user.id)
      const statistics = await workspaceProcessing.getWorkspaceStatistics(workspaceId)
      return {
        workspaceId,
        statistics,
      }
    },
  }),
)

builder.queryField('workers', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: [WorkspaceWorker],
    nullable: false,
    resolve: async (_root, _args, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      const workers = await workerRegistry.getWorkerRegistryEntries({})
      return workers.map((worker) => ({
        workerId: worker.workerId,
        workerType: worker.workerType,
        healthy: new Date(worker.lastHeartbeat).getTime() >= Date.now() - 60000,
        lastHeartbeatAt: worker.lastHeartbeat,
      }))
    },
  }),
)
