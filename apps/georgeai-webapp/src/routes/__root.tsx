import { QueryClient, useQuery } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Suspense } from 'react'

import { AuthProvider } from '../auth/auth-provider'
import { currentUserQueryOptions } from '../auth/queries'
import { GeorgeToaster } from '../components/georgeToaster'
import { SidebarLayout } from '../components/sidebar/sidebar-layout'
import { getThemeQueryOptions } from '../hooks/use-theme'
import { getLanguageQueryOptions, useLanguage } from '../i18n/use-language-hook'
import appCss from '../index.css?url'

interface RouterContext {
  queryClient: QueryClient
}

const RootDocument = () => {
  const { user } = Route.useRouteContext()
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
            <SidebarLayout user={user} />
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
      </body>
    </html>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context }) => {
    const [currentUserResult, languageResult, themeResult] = await Promise.allSettled([
      context.queryClient.ensureQueryData(currentUserQueryOptions()),
      context.queryClient.ensureQueryData(getLanguageQueryOptions()),
      context.queryClient.ensureQueryData(getThemeQueryOptions()),
    ])

    return {
      user: currentUserResult.status === 'fulfilled' ? currentUserResult.value : null,
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
