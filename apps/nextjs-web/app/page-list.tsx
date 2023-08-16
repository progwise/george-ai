'use client'

import { ScrapedWebPageFragmentFragment } from '@/src/gql/graphql'
import { InfoCard } from './components/info-card/info-card'
import useFetchData from './fetch-data'
import Loading from './loading'

export const PageList = () => {
  const result = useFetchData()

  if (result.fetching) return <Loading />

  const pages = result.data?.allPages

  return (
    <>
      {pages?.map((page: ScrapedWebPageFragmentFragment) => (
        <div key={page.url}>
          <InfoCard page={page} />
        </div>
      ))}
    </>
  )
}
