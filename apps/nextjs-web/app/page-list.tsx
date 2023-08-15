import { InfoCard } from './components/info-card'
import fetchData from './fetch-data'

export const PageList = async () => {
  const fetchPages = await fetchData()
  const pages = fetchPages.allPages
  return (
    <>
      {pages.map((page) => (
        <div key={page.url}>
          <InfoCard page={page} />
        </div>
      ))}
    </>
  )
}
