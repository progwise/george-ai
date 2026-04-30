import { WorkerSlotEntry } from '@george-ai/event-service-client'

import { builder } from '../builder'

builder.objectRef<WorkerSlotEntry>('WorkerSlotEntry').implement({
  fields: (t) => ({
    workerId: t.exposeString('workerId'),
    workerRole: t.field({
      type: 'WorkerRole',
      resolve: (root) => root.role,
    }),
    lastHeartbeat: t.expose('lastHeartbeat', { type: 'DateTime' }),
    signedUp: t.expose('signedUp', { type: 'DateTime' }),
    latestActivity: t.expose('latestActivity', { type: 'DateTime' }),
    latestActivityResult: t.expose('latestActivityResult', { type: 'WorkerActionResult' }),
    latestActionStart: t.expose('latestActionStart', { type: 'DateTime' }),
    latestActionEnd: t.expose('latestActionEnd', { type: 'DateTime' }),
    latestActionFailure: t.expose('latestActionFailure', { type: 'DateTime' }),
    startedActions: t.exposeInt('startedActions'),
    failedActions: t.exposeInt('failedActions'),
  }),
})
