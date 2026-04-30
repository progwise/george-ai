import { WORKER_ROLES } from '@george-ai/app-schema'

import { builder } from '../builder'

builder.enumType('WorkerRole', {
  values: WORKER_ROLES,
})
