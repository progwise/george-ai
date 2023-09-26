'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export const Keywords = ({ keywords }: { keywords: string[] }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParameters = useSearchParams()

  const handleFilterChange = (keyword: string) => {
    const updatedParameter = new URLSearchParams(searchParameters.toString())
    const keywordFilters = searchParameters.getAll('kw')

    if (keywordFilters.includes(keyword)) {
      updatedParameter.delete('kw')

      for (const item of keywordFilters) {
        if (item !== keyword) {
          updatedParameter.append('kw', item)
        }
      }
    } else {
      updatedParameter.append('kw', keyword)
    }

    router.replace(pathname + '?' + updatedParameter.toString(), {
      scroll: false,
    })
  }

  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map(
        (keyword, index) =>
          keyword && (
            <button
              key={`${keyword}_${index}`}
              className="border border-black rounded-md text-xs px-4 bg-slate-100 hover:bg-slate-300 cursor-pointer"
              onClick={() => handleFilterChange(keyword)}
            >
              {keyword}
            </button>
          ),
      )}
    </div>
  )
}
