import { builder } from '../builder'

builder.queryField('version', (t) =>
  t.string({
    resolve: () => process.env.GIT_COMMIT_SHA,
  }),
)
