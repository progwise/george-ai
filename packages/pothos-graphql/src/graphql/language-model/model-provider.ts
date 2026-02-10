import { MODEL_PROVIDERS } from '@george-ai/app-commons'

import { builder } from '../builder'

builder.enumType('ModelProvider', {
  values: MODEL_PROVIDERS,
})
