'use client'

import { Header } from './components/header'
import { SearchBox } from './components/search-box'
import { InfoCard } from './components/info-card'
import React, { useState, useEffect } from 'react'
import fetchData from './fetch-data'
import { Spinner } from './components/spinner'

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

export default function Home() {
  const [pages, setPages] = useState<Page[]>([])

  useEffect(() => {
    async function loadAndSetData() {
      try {
        const pagesData = await fetchData()
        setPages(pagesData)
      } catch (error) {
        console.error(error)
      }
    }
    loadAndSetData()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 ">
      <div className="max-w-2xl w-full flex flex-col gap-5">
        <Header />
        <SearchBox />
        <span className="border-b border-black">
          ich habe folgende Informationen für Sie gefunden:
        </span>
        {pages && pages.length > 0 ? (
          pages.map((page) => (
            <div key={page.url}>
              <InfoCard page={page} />
            </div>
          ))
        ) : (
          <div className="flex justify-center">
            <Spinner size={'medium'} />
          </div>
        )}
      </div>
    </main>
  )
}
