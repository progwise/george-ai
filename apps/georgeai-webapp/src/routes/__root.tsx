import { QueryClient, useQuery } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Suspense, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { AuthProvider } from '../auth/auth'
import { getUserQueryOptions } from '../auth/get-user'
import BottomNavigationMobile from '../components/bottom-navigation-mobile'
import { GeorgeToaster } from '../components/georgeToaster'
import { Sidebar } from '../components/sidebar'
import TopNavigation from '../components/top-navigation'
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <html lang={language} data-theme={theme}>
      <head>
        <HeadContent />
      </head>
      <body className="px-body">
        <AuthProvider>
          <>
            <div className="drawer lg:drawer-open">
              <input
                id="sidebar"
                type="checkbox"
                className="drawer-toggle"
                checked={isDrawerOpen}
                onChange={(e) => setIsDrawerOpen(e.target.checked)}
              />
              <div
                className={twMerge(
                  'drawer-content transition-all duration-250 ease-in',
                  isDrawerOpen ? 'lg:pl-64' : 'lg:pl-14',
                )}
              >
                <TopNavigation user={user} workspaceId={workspaceId} isDrawerOpen={isDrawerOpen} />
                <div>
                  <Outlet />
                </div>
              </div>
              <Sidebar user={user} />
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

    const workspaceId = context.queryClient.getQueryData(['selectedWorkspaceId'])?.toString() || null

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
