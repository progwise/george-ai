import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import { routerWithQueryClient } from '@tanstack/react-router-with-query'
import { getKeycloak, registerAuthEvents } from './auth/keycloak'
import { getInitialAuthContext } from './auth/auth-context'

export function createRouter() {
  const queryClient = new QueryClient()
  const keycloak = getKeycloak()
  const auth = getInitialAuthContext(keycloak)

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient, auth },
    defaultPreload: 'intent',
    defaultErrorComponent: () => <div>Ups, something went wrong!</div>,
    defaultNotFoundComponent: () => <div>Not found!</div>,
    defaultPendingComponent: () => <div>Loading...</div>,
  })

  registerAuthEvents(keycloak, router, auth)

  return routerWithQueryClient(router, queryClient)
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
