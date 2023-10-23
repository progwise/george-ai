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
    <div className="card-actions">
      {keywords.map(
        (keyword, index) =>
          keyword && (
            <button
              key={`${keyword}_${index}`}
              className="btn btn-outline btn-info btn-xs"
              onClick={() => handleFilterChange(keyword)}
            >
              {keyword}
            </button>
          ),
      )}
    </div>
  )
}
