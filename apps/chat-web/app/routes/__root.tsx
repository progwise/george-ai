import { QueryClient } from '@tanstack/react-query'
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import React, { Suspense } from 'react'

import { GeorgeToaster } from '../components/georgeToaster'
import TopNavigation, { getTheme } from '../components/top-navigation'
import { getLanguage } from '../i18n'
import appCss from '../index.css?url'

interface RouterContext {
  queryClient: QueryClient
  language: 'en' | 'de'
}

const TanStackRouterDevtools =
  process.env.NODE_ENV === 'production'
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import('@tanstack/router-devtools').then((result) => ({
          default: result.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        })),
      )

const TanStackQueryDevtools =
  process.env.NODE_ENV === 'production'
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import('@tanstack/react-query-devtools').then((result) => ({
          default: result.ReactQueryDevtools,
          // For Embedded Mode
          // default: res.TanStackQueryDevtoolsPanel
        })),
      )

const RootDocument = () => {
  const { theme } = Route.useRouteContext()
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body className="container mx-auto">
        <TopNavigation theme={theme} />
        <Outlet />
        <Scripts />
        <Suspense>
          <TanStackRouterDevtools />
        </Suspense>
        <Suspense>
          <TanStackQueryDevtools />
        </Suspense>
        <GeorgeToaster />
      </body>
    </html>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    const theme = await getTheme()
    const language = await getLanguage()
    // const theme = getCookie('theme') //todo: use const

    return {
      theme: theme,
      language: language,
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
    scripts: [
      // fixes HMR not working issues, see https://github.com/TanStack/router/issues/1992
      !import.meta.env.DEV
        ? undefined
        : {
            type: 'module',
            children: `import RefreshRuntime from "/_build/@react-refresh";
    RefreshRuntime.injectIntoGlobalHook(window)
    window.$RefreshReg$ = () => {}
    window.$RefreshSig$ = () => (type) => type`,
          },
    ],
  }),
  component: RootDocument,
})
