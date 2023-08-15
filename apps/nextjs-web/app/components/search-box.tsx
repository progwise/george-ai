'use client'

import { useState } from 'react'
import Image from 'next/image'

export const SearchBox = () => {
  const [inputValue, setInputValue] = useState('')

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
    console.log('inputValue:', inputValue)
  }

  return (
    <div className="relative">
      <input
        className="border border-black rounded-md w-full p-1 px-2"
        type="text"
        placeholder="Stellen Sie Ihre Frage an das Intranet..."
        value={inputValue}
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
