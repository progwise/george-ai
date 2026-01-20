import { workspace } from '@george-ai/app-domain'

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
      const statistics = await workspace.getWorkspaceStatistics(workspaceId)
      return {
        workspaceId,
        statistics,
      }
    },
  }),
)

builder.queryField('workspaceWorkers', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: [WorkspaceWorker],
    nullable: false,
    resolve: async (_root, _args, context) => {
      const workspaceId = context.workspaceId
      await canReadWorkspaceOrThrow(workspaceId, context.session.user.id)
      const workerStatistics = await workspace.getWorkerStatistics(workspaceId)
      return workerStatistics.workers.map((worker) => ({
        workerId: worker.workerId,
        workerType: worker.workerType,
        healthy: new Date(worker.lastHeartbeat).getTime() >= Date.now() - 60000,
        lastHeartbeatAt: worker.lastHeartbeat,
      }))
    },
  }),
)
