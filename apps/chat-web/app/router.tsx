import { QueryClient } from '@tanstack/react-query'
import { createRouteMask, createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routerWithQueryClient } from '@tanstack/react-router-with-query'

import { routeTree } from './routeTree.gen'

export function createRouter() {
  const queryClient = new QueryClient()

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient, language: 'en', theme: 'light' },
    defaultPreload: 'intent',
    defaultErrorComponent: () => <div>Ups, something went wrong!</div>,
    defaultNotFoundComponent: () => <div>Not found!</div>,
    defaultPendingComponent: () => <div>Loading...</div>,
    routeMasks: [
      createRouteMask({
        routeTree,
        from: '/conversations/$conversationId/settings',
        to: '/conversations/$conversationId',
        params: (prev) => ({ conversationId: prev.conversationId }),
      }),
      createRouteMask({
        routeTree,
        from: '/conversations/$conversationId/settings/users',
        to: '/conversations/$conversationId',
        params: (prev) => ({ conversationId: prev.conversationId }),
      }),
      createRouteMask({
        routeTree,
        from: '/conversations/$conversationId/leave',
        to: '/conversations/$conversationId',
        params: (prev) => ({ conversationId: prev.conversationId }),
      }),
    ],
  })
  return routerWithQueryClient(router, queryClient)
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
