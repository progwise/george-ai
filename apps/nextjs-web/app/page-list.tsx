import { InfoCard } from './components/info-card'
import fetchData from './fetch-data'

export const PageList = async () => {
  const pages = await fetchData()
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
