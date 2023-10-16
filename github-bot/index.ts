import type { ApplicationFunction, Context } from 'probot'

const appFunction: ApplicationFunction = (app) => {
  app.on(
    'pull_request.opened',
    async (context: Context<'pull_request.opened'>) => {
      const issueComment = context.issue({
        body: 'Thanks for the pull request!',
      })
      await context.octokit.issues.createComment(issueComment)
    },
  )
}

export default appFunction
