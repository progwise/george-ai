'use client'

import Image from 'next/image'
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
    router.replace(pathname + '?' + updatedParameter.toString())
  }

  return (
    <div className="relative">
      <input
        className="border border-black rounded-md w-full p-1 px-2"
        type="text"
        value={query ?? ''}
        placeholder="Stellen Sie Ihre Frage an das Intranet..."
        onChange={handleInputChange}
      />

      <Image
        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8"
        src="/vector.svg"
        alt="Vector"
        width={48}
        height={48}
        priority
      />
    </div>
  )
}
