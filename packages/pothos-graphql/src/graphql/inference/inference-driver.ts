import { INFERENCE_DRIVERS } from '@george-ai/app-schema'

import { builder } from '../builder'

builder.enumType('InferenceDriver', {
  values: INFERENCE_DRIVERS,
})
