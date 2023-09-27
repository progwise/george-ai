'use client'

import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export const KeywordsDeselection = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParameters = useSearchParams()
  const keywords = searchParameters.getAll('kw')

  const handleFilterChange = (keyword: string) => {
    const updatedParameter = new URLSearchParams(searchParameters.toString())

    updatedParameter.delete('kw')

    for (const item of keywords) {
      if (item !== keyword) {
        updatedParameter.append('kw', item)
      }
    }

    router.replace(pathname + '?' + updatedParameter.toString(), {
      scroll: false,
    })
  }

  return (
    <div className="flex justify-end flex-wrap gap-2 min-h-[18px]">
      {keywords.map(
        (keyword, index) =>
          keyword && (
            <button
              key={`${keyword}_${index}`}
              className="flex gap-1 border border-black rounded-md text-xs px-4 pl-2 bg-slate-100 hover:bg-slate-300 cursor-pointer"
              onClick={() => handleFilterChange(keyword)}
            >
              <Image
                className=""
                src="/delete.svg"
                alt="delete-keyword"
                width={16}
                height={16}
                priority
              />
              <span>{keyword}</span>
            </button>
          ),
      )}
    </div>
  )
}
