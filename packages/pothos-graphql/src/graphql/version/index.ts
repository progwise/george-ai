import { builder } from '../builder'

console.log('process.env.GIT_COMMIT_SHA', process.env.GIT_COMMIT_SHA)
builder.queryField('version', (t) =>
  t.string({
    resolve: () => process.env.GIT_COMMIT_SHA,
  }),
)
