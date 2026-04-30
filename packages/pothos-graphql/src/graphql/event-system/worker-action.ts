import { WORKER_ACTION_RESULTS } from '@george-ai/app-schema'

import { builder } from '../builder'

builder.enumType('WorkerActionResult', {
  values: WORKER_ACTION_RESULTS,
})
