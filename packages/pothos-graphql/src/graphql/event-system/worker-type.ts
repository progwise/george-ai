import { WORKER_TYPES } from '@george-ai/app-commons'

import { builder } from '../builder'

builder.enumType('WorkerType', {
  values: WORKER_TYPES,
})
