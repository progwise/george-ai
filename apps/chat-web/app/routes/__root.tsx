import { QueryClient } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  Outlet,
  ScrollRestoration,
} from '@tanstack/react-router'
import { Meta, Scripts } from '@tanstack/start'
import React, { Suspense } from 'react'

import appCss from '../index.css?url'
import TopNavigation from '../components/top-navigation'
import { AuthContext, AuthProvider } from '../auth'

interface RouterContext {
  queryClient: QueryClient
  auth: AuthContext
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

const RootDocument = () => (
  <html>
    <head>
      <Meta />
    </head>
    <body className="container mx-auto">
      <AuthProvider>
        <TopNavigation />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <Suspense>
          <TanStackRouterDevtools />
        </Suspense>
        <Suspense>
          <TanStackQueryDevtools />
        </Suspense>
      </AuthProvider>
    </body>
  </html>
)

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'George-AI',
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
