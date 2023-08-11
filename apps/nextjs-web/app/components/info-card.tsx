import Image from 'next/image'
import { Page } from '../page'

export const InfoCard = ({ page }: { page: Page }) => {
  console.log('typen', typeof page.webPageSummaries[0].generatedKeywords)
  return (
    <div className="flex flex-col gap-5 border-2 p-8 rounded-md">
      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <span className="font-bold text-lg">{page.title}</span>
          <div className="border border-black rounded-md px-6 bg-slate-100">
            draft
          </div>
          <div className="border border-black rounded-md px-6 bg-slate-100">
            published
          </div>
        </div>
        <div className="flex gap-4">
          <Image
            src="/thumbs-up.svg"
            alt="Thumbs Up"
            className="dark:invert"
            width={24}
            height={24}
            priority
          />
          <Image
            src="/thumbs-down-outline.svg"
            alt="Thumbs Down outline"
            className="dark:invert"
            width={24}
            height={24}
            priority
          />
        </div>
      </div>

      <div>
        <span className="line-clamp-3">
          {page.webPageSummaries[0].generatedSummary}
        </span>
      </div>
      <div>
        <span>Quelle: </span>
        <a className="text-blue-500" href={page.url} target="_blank">
          {page.url}
        </a>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {JSON.parse(page.webPageSummaries[0].generatedKeywords).map(
            (keyword: string, index: string) => (
              <div
                key={index}
                className="border border-black rounded-md px-6 bg-slate-100"
              >
                {keyword}
              </div>
            ),
          )}

          <div className="border border-black rounded-md px-6 bg-slate-100">
            Allgemeines
          </div>
          <div className="border border-black rounded-md px-6 bg-slate-100">
            Urlaub
          </div>
        </div>
        <div className="">
          <button className="border border-black rounded-md px-6 text-xl bg-slate-100">
            Details...
          </button>
        </div>
      </div>
    </div>
  )
}
