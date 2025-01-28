import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import { routerWithQueryClient } from '@tanstack/react-router-with-query'

export function createRouter() {
  const queryClient = new QueryClient()

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient, auth: undefined! },
    defaultPreload: 'intent',
    defaultErrorComponent: () => <div>Ups, something went wrong!</div>,
    defaultNotFoundComponent: () => <div>Not found!</div>,
    defaultPendingComponent: () => <div>Loading...</div>,
  })

  return routerWithQueryClient(router, queryClient)
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
