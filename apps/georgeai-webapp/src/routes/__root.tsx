import { QueryClient, useQuery } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Suspense } from 'react'

import { AuthProvider } from '../auth/auth'
import { getUserQueryOptions } from '../auth/get-user'
import BottomNavigationMobile from '../components/bottom-navigation-mobile'
import { GeorgeToaster } from '../components/georgeToaster'
import TopNavigation from '../components/top-navigation'
import { getWorkspacesQueryOptions } from '../components/workspace/queries/get-workspaces'
import { validateAndFixWorkspaceCookie } from '../components/workspace/server-functions/workspace-cookie'
import { getThemeQueryOptions } from '../hooks/use-theme'
import { getLanguageQueryOptions, useLanguage } from '../i18n/use-language-hook'
import appCss from '../index.css?url'

interface RouterContext {
  queryClient: QueryClient
}

const RootDocument = () => {
  const { user, workspaceId } = Route.useRouteContext()
  const { language } = useLanguage()
  const { data: theme } = useQuery(getThemeQueryOptions())

  return (
    <html lang={language} data-theme={theme}>
      <head>
        <HeadContent />
      </head>
      <body className="px-body">
        <AuthProvider>
          <>
            <TopNavigation user={user} workspaceId={workspaceId} />
            <div className="flex grow flex-col p-4">
              <Outlet />
            </div>
            <Scripts />
            <Suspense>
              <TanStackRouterDevtools />
            </Suspense>
            <Suspense>
              <ReactQueryDevtools />
            </Suspense>
            <GeorgeToaster />
          </>
        </AuthProvider>
        <BottomNavigationMobile />
      </body>
    </html>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context }) => {
    const [user] = await Promise.all([
      context.queryClient.ensureQueryData(getUserQueryOptions()),
      context.queryClient.ensureQueryData(getLanguageQueryOptions()),
      context.queryClient.ensureQueryData(getThemeQueryOptions()),
    ])

    // Validate and fix workspace cookie before any workspace-scoped queries run
    // This prevents errors when users have stale/inaccessible workspace IDs in cookies
    // IMPORTANT: The backend rejects authentication entirely if the workspace ID in the cookie
    // is invalid (see getUserContext.ts:35-38), so we must fix it BEFORE fetching workspaces.
    let workspaceId: string | null = null
    if (user) {
      try {
        // First, ensure we have a valid workspace cookie using the user's default workspace
        // This is a fallback - if the cookie is already valid, validateAndFixWorkspaceCookie
        // will return quickly without changing anything
        await validateAndFixWorkspaceCookie({
          data: {
            accessibleWorkspaceIds: [user.defaultWorkspaceId], // Use default as initial fallback
            userDefaultWorkspaceId: user.defaultWorkspaceId,
          },
        })

        // Now we can safely fetch workspaces (cookie is at least pointing to a valid workspace)
        const workspaces = await context.queryClient.ensureQueryData(getWorkspacesQueryOptions())
        if (workspaces && workspaces.length > 0) {
          // Re-validate with full list of accessible workspaces
          const accessibleWorkspaceIds = workspaces.map((w) => w.id)
          const result = await validateAndFixWorkspaceCookie({
            data: {
              accessibleWorkspaceIds,
              userDefaultWorkspaceId: user.defaultWorkspaceId,
            },
          })
          workspaceId = result.workspaceId ?? null
        }
      } catch (error) {
        // If workspaces query fails (e.g., expired token), ignore and let the auth flow handle it
        console.error('Failed to fetch workspaces in root beforeLoad:', error)
      }
    }

    return { user, workspaceId }
  },
  head: () => ({
    meta: [
      { charSet: 'utf8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'George-Ai',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    ],
  }),
  component: RootDocument,
})
