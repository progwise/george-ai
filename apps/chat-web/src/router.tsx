import { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'

import { routeTree } from './routeTree.gen'

export function getRouter() {
  const queryClient = new QueryClient()

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultErrorComponent: ({ error }) => (
      <div className="text-center">
        Ups, something went wrong!{' '}
        <code>
          <pre>{JSON.stringify(error.stack, null, 2)}</pre>
        </code>
      </div>
    ),
    defaultNotFoundComponent: () => <div className="text-center">Not found!</div>,
    defaultPendingComponent: () => <div className="text-center">Loading...</div>,
  })
  setupRouterSsrQueryIntegration({ router, queryClient })
  return router
}
