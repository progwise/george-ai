import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import { routerWithQueryClient } from '@tanstack/react-router-with-query'

export function createRouter() {
  const queryClient = new QueryClient()

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
    defaultErrorComponent: () => <div>Ups, something went wrong!</div>,
    defaultNotFoundComponent: () => <div>Not found!</div>,
    defaultPendingComponent: () => <div>Loading...</div>,
  })

  const finalRouter = routerWithQueryClient(router, queryClient)

  return finalRouter
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
