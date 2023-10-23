import { Header } from './components/header'
import { SearchBox } from './components/search-box'
import React, { Suspense } from 'react'
import { PageList } from './page-list'
import Loading from './loading'
import { Metadata } from 'next'
import { FilterSelection } from './components/filter-selection/filter-selection'
import { KeywordsDeselection } from './components/keyords-deselection'

interface WebPageSummary {
  id: string
  feedback?: 'up' | 'down'
  generatedKeywords: string
  generatedSummary: string
  largeLanguageModel: string
}

export interface Page {
  title: string
  url: string
  locale: string
  publishedAt: string | null
  webPageSummaries: WebPageSummary[]
}

export const metadata: Metadata = {
  title: 'George-AI',
  description: 'The intelligent index for your website',
}

function normalizeToArray(
  value: string | string[] | undefined,
): string[] | undefined {
  if (!value) {
    return undefined
  }
  if (Array.isArray(value)) {
    return value
  }
  return [value]
}

export default function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  return (
    <main
      data-theme={searchParams.theme?.toString() ?? 'light'}
      className="flex min-h-screen flex-col items-center px-12 py-24 ease-in-out duration-100"
    >
      <div className="max-w-2xl w-full flex flex-col gap-5">
        <Header />
        <SearchBox />
        <Suspense fallback={<Loading />}>
          <FilterSelection
            lang={normalizeToArray(searchParams.lang)}
            status={normalizeToArray(searchParams.status)}
            llm={normalizeToArray(searchParams.llm)}
          />
          <KeywordsDeselection />
          <div>
            <span>ich habe folgende Informationen für Sie gefunden:</span>
            <div className="divider" />
          </div>
          <PageList
            query={searchParams.query?.toString()}
            lang={normalizeToArray(searchParams.lang)}
            status={normalizeToArray(searchParams.status)}
            llm={normalizeToArray(searchParams.llm)}
            kw={normalizeToArray(searchParams.kw)}
          />
        </Suspense>
      </div>
    </main>
  )
}
