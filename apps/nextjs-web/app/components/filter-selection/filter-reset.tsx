'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

interface FilterCheckboxProps {
  value: string
  checked: boolean
  filter: string
  valueArray: string[]
}

export const FilterReset = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParameters = useSearchParams()!

  const handleFilterReset = () => {
    const updatedParameters = new URLSearchParams(searchParameters.toString())

    updatedParameters.delete('lang')
    updatedParameters.delete('llm')
    updatedParameters.delete('status')

    router.replace(pathname + '?' + updatedParameters.toString())
  }

  return (
    <button
      className="max-w-max max-h-max border border-black rounded-md px-4 text-m bg-slate-100 hover:bg-slate-300"
      onClick={handleFilterReset}
    >
      Filter reset
    </button>
  )
}
