import { WorkerEntry } from '@george-ai/event-service-client'

import { builder } from '../builder'

builder.objectRef<WorkerEntry>('WorkerEntry').implement({
  fields: (t) => ({
    workerId: t.exposeString('workerId'),
    workerType: t.field({
      type: 'WorkerType',
      resolve: (root) => root.workerType,
    }),
    lastHeartbeat: t.exposeString('lastHeartbeat'),
  }),
})
