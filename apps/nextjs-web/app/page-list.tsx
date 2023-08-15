'use client'

import { InfoCard } from './components/info-card/info-card'
import useFetchData from './fetch-data'
import Loading from './loading'
import { Page } from './page'

export const PageList = () => {
  const result = useFetchData()

  if (result.fetching) return <Loading />

  const pages = result.data?.allPages

  return (
    <>
      {pages.map((page: Page) => (
        <div key={page.url}>
          <InfoCard page={page} />
        </div>
      ))}
    </>
  )
}
