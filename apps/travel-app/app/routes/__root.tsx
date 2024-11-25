import { QueryClient } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  Link,
  Outlet,
  ScrollRestoration,
} from '@tanstack/react-router'
import { Meta, Scripts } from '@tanstack/start'
import React, { ReactNode, Suspense } from 'react'

import '../index.css'

const RootComponent = () => (
  <RootDocument>
    <Outlet />
  </RootDocument>
)

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
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
  },
)

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

const TanStackQueryDevtools =
  process.env.NODE_ENV === 'production'
    ? // eslint-disable-next-line unicorn/no-null
      () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import('@tanstack/react-query-devtools').then((result) => ({
          default: result.ReactQueryDevtools,
          // For Embedded Mode
          // default: res.TanStackQueryDevtoolsPanel
        })),
      )

const RootDocument = ({ children }: Readonly<{ children: ReactNode }>) => (
  <html>
    <head>
      <Meta />
    </head>
    <body className="container mx-auto">
      <nav className="navbar bg-primary/10">
        <Link className="btn btn-ghost" to="/">
          Home
        </Link>
        <Link className="btn btn-ghost" to="/chat">
          Chat
        </Link>
      </nav>
      {children}
      <ScrollRestoration />
      <Scripts />
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
      <Suspense>
        <TanStackQueryDevtools />
      </Suspense>
    </body>
  </html>
)
