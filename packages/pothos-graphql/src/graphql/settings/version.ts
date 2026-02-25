import { getConfigValue } from '@george-ai/app-commons'

import { builder } from '../builder'

builder.queryField('version', (t) =>
  t.string({
    resolve: () => getConfigValue('GIT_COMMIT_SHA'),
  }),
)
