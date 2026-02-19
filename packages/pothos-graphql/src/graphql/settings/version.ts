import { getConfig } from '@george-ai/app-domain'

import { builder } from '../builder'

builder.queryField('version', (t) =>
  t.string({
    resolve: () => getConfig('GIT_COMMIT_SHA'),
  }),
)
