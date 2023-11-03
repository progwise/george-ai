'use client'

import { DeleteSvg } from '@/public/delete-svg'
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
    <div className="flex justify-end flex-wrap gap-2 min-h-6">
      {keywords.map(
        (keyword, index) =>
          keyword && (
            <button
              key={`${keyword}_${index}`}
              className="btn btn-outline btn-info btn-xs gap-1"
              onClick={() => handleFilterChange(keyword)}
            >
              <DeleteSvg />
              <span>{keyword}</span>
            </button>
          ),
      )}
    </div>
  )
}
