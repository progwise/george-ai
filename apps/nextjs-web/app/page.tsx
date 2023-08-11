import Image from 'next/image'
import { Header } from './components/header'
import { SearchBox } from './components/search-box'
import { InfoCard } from './components/info-card'

interface WebPageSummary {
  id: string
  generatedKeywords: string
  generatedSummary: string
  largeLanguageModel: string
}

export interface Page {
  title: string
  url: string
  webPageSummaries: WebPageSummary[]
}

export default async function Home() {
  let pages: Page[] = []

  try {
    const resonse = await fetch('http://localhost:3000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
      },
      body: JSON.stringify({
        query: `
      query GetScrapedWebPages {
        allPages {
          title
          url
          webPageSummaries {
            id
            generatedKeywords
            generatedSummary
            largeLanguageModel
          }
        }
      }
      `,
      }),
    })
    const respon = await resonse.json()
    pages = respon.data.allPages
    console.log('pages:', pages)
  } catch (error) {
    console.error(error)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 ">
      <div className="max-w-3xl flex flex-col gap-5">
        <Header />
        <SearchBox />
        <span className="border-b border-black">
          ich habe folgende Informationen für Sie gefunden:
        </span>
        {pages.map((page, index) => (
          <div key={index}>
            <InfoCard page={page} />
          </div>
        ))}
      </div>
    </main>
  )
}
