import {
  createRootRoute,
  Outlet,
  ScrollRestoration,
} from '@tanstack/react-router'
import { Meta, Scripts } from '@tanstack/start'
import React, { ReactNode, Suspense } from 'react'

const RootComponent = () => (
  <RootDocument>
    <Outlet />
  </RootDocument>
)

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Travel App',
      },
    ],
  }),
  component: RootComponent,
})

const TanStackRouterDevtools =
  process.env.NODE_ENV === 'production'
    ? // eslint-disable-next-line unicorn/no-null
      () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import('@tanstack/router-devtools').then((result) => ({
          default: result.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        })),
      )

const RootDocument = ({ children }: Readonly<{ children: ReactNode }>) => (
  <html>
    <head>
      <Meta />
    </head>
    <body>
      {children}
      <ScrollRestoration />
      <Scripts />
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </body>
  </html>
)
