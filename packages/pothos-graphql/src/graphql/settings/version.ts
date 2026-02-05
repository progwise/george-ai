import config from '../../config'
import { builder } from '../builder'

builder.queryField('version', (t) =>
  t.string({
    resolve: () => config('GIT_COMMIT_SHA'),
  }),
)
