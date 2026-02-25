import { QueryClient, useQuery } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Suspense } from 'react'

import { AuthProvider } from '../auth/auth-provider'
import { currentUserQueryOptions } from '../auth/queries'
import BottomNavigationMobile from '../components/bottom-navigation-mobile'
import { GeorgeToaster } from '../components/georgeToaster'
import TopNavigation from '../components/top-navigation'
import { getWorkspacesQueryOptions } from '../components/workspace/queries'
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
    const [currentUserResult, workspacesResult, languageResult, themeResult] = await Promise.allSettled([
      context.queryClient.ensureQueryData(currentUserQueryOptions()),
      context.queryClient.ensureQueryData(getWorkspacesQueryOptions()),
      context.queryClient.ensureQueryData(getLanguageQueryOptions()),
      context.queryClient.ensureQueryData(getThemeQueryOptions()),
    ])

    // TODO: Do not set workspaceId if user has no access to it
    const selectedWorkspaceId = context.queryClient.getQueryData(['selectedWorkspaceId'])?.toString() || null

    return {
      user: currentUserResult.status === 'fulfilled' ? currentUserResult.value : null,
      workspaceId:
        workspacesResult.status === 'fulfilled'
          ? workspacesResult?.value?.items?.find((workspace) => workspace.id === selectedWorkspaceId)?.id
          : null,
      language: languageResult.status === 'fulfilled' ? languageResult.value : 'en',
      theme: themeResult.status === 'fulfilled' ? themeResult.value : 'light',
    }
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
