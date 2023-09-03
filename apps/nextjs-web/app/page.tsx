import { Header } from './components/header'
import { SearchBox } from './components/search-box'
import React, { Suspense } from 'react'
import { PageList } from './page-list'
import Loading from './loading'
import { Metadata } from 'next'
import { FilterSelection } from './components/filter-selection/filter-selection'

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

export default function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  return (
    <main className="flex min-h-screen flex-col items-center select-none p-24 ">
      <div className="max-w-2xl w-full flex flex-col gap-5">
        <Header />
        <SearchBox query={searchParams.query?.toString()} />
        <Suspense fallback={<Loading />}>
          <FilterSelection
            lang={searchParams.lang?.toString()}
            status={searchParams.status?.toString().toLowerCase()}
            llm={searchParams.llm?.toString()}
          />

          <span className="border-b border-black">
            ich habe folgende Informationen für Sie gefunden:
          </span>
          <PageList
            query={searchParams.query?.toString()}
            lang={searchParams.lang?.toString()}
            status={searchParams.status?.toString().toLowerCase()}
            llm={searchParams.llm?.toString()}
          />
        </Suspense>
      </div>
    </main>
  )
}
