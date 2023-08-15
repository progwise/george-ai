import { Header } from './components/header'
import { SearchBox } from './components/search-box'
import React, { useState, useEffect, Suspense } from 'react'
import { PageList } from './page-list'
import Loading from './loading'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 ">
      <div className="max-w-2xl w-full flex flex-col gap-5">
        <Header />
        <SearchBox />
        <span className="border-b border-black">
          ich habe folgende Informationen für Sie gefunden:
        </span>
        <Suspense fallback={<Loading />}>
          <PageList />
        </Suspense>
      </div>
    </main>
  )
}
