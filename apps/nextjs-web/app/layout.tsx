'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import {
  UrqlProvider,
  createClient,
  ssrExchange,
  cacheExchange,
  fetchExchange,
} from '@urql/next'

const inter = Inter({ subsets: ['latin'] })

const ssr = ssrExchange()
const client = createClient({
  url: 'http://localhost:3000/graphql',
  exchanges: [cacheExchange, ssr, fetchExchange],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UrqlProvider client={client} ssr={ssr}>
      <html lang="en" className="scroll-smooth">
        <body className={inter.className}>{children}</body>
      </html>
    </UrqlProvider>
  )
}
