import { InfoCard } from './components/info-card/info-card'
import fetchData from './fetch-data'

export const PageList = async () => {
  const fetchedPages = await fetchData()
  const pages = fetchedPages.allPages
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
