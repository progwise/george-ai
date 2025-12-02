import { GIT_COMMIT_SHA } from '../../global-config'
import { builder } from '../builder'

console.log('GIT_COMMIT_SHA', GIT_COMMIT_SHA)

builder.queryField('version', (t) =>
  t.string({
    resolve: () => GIT_COMMIT_SHA,
  }),
)
