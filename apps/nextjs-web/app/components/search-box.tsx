'use client'

import { VectorSvg } from '@/public/vector-svg'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export const SearchBox = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParameters = useSearchParams()
  const query = searchParameters.get('query')

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value
    const updatedParameter = new URLSearchParams(searchParameters.toString())
    if (inputValue) {
      updatedParameter.set('query', inputValue)
    } else {
      updatedParameter.delete('query')
    }
    router.replace(pathname + '?' + updatedParameter.toString(), {
      scroll: false,
    })
  }

  return (
    <div className="relative">
      <input
        className="input input-bordered w-full"
        type="text"
        defaultValue={query ?? ''}
        placeholder="Stellen Sie Ihre Frage an das Intranet..."
        onChange={handleInputChange}
      />
      <VectorSvg />
    </div>
  )
}
