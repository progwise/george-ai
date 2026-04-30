import { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'

import { DefaultError } from './components/default-error'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const queryClient = new QueryClient()

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultErrorComponent: (error) => <DefaultError {...error} />,
    defaultNotFoundComponent: () => <div className="text-center">Not found!</div>,
    defaultPendingComponent: () => (
      <div className="text-center text-accent">
        <span className="loading loading-xl loading-bars"></span>
      </div>
    ),
  })
  setupRouterSsrQueryIntegration({ router, queryClient })
  return router
}
