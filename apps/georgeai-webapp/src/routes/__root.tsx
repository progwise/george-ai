import { QueryClient, useQuery } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HeadContent, Scripts, createRootRouteWithContext, redirect } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Suspense } from 'react'

import { AuthProvider } from '../auth/auth-provider'
import { currentUserQueryOptions } from '../auth/queries'
import { logger } from '../common'
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

    if (currentUserResult.status === 'rejected') {
      logger.warn('Failed to load current user data', { error: currentUserResult.reason })
      if (currentUserResult.reason instanceof String && currentUserResult.reason.includes('Unauthorized')) {
        // If the error is an unauthorized error, we can ignore it since it just means the user is not logged in
        logger.info('User is not logged in')
        throw redirect({ to: '/login' })
      } else {
        // For other types of errors, we might want to show a notification to the user
        logger.error('An unexpected error occurred while loading user data', { error: currentUserResult.reason })
      }
    }

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
