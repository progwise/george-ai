import Image from 'next/image'
import { Header } from './components/header'
import { SearchBox } from './components/search-box'
import { InfoCard } from './components/info-card'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 ">
      <div className="max-w-3xl flex flex-col gap-5">
        <Header />
        <SearchBox />
        <InfoCard />
      </div>
    </main>
  )
}
