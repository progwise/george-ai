'use client'

import { PublicationState } from '@/src/gql/graphql'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export interface FilterSelectionProps {
  language?: string
  status?: string
  largeLanguageModel?: string
}

export const FilterSelection = ({
  language,
  status,
  largeLanguageModel,
}: FilterSelectionProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParameters = useSearchParams()!

  const handleClick = (filter: string) => {
    const updatedParameter = new URLSearchParams(searchParameters.toString())

    updatedParameter.delete(filter)

    router.replace(pathname + '?' + updatedParameter.toString())
  }

  return (
    <div>
      {status && (
        <button
          onClick={() => handleClick('status')}
          className="border border-black rounded-md text-xs px-4 cursor-pointer bg-slate-100 hover:bg-slate-300"
        >
          {status}
        </button>
      )}
      {language && (
        <button
          onClick={() => handleClick('language')}
          className="border border-black rounded-md text-xs px-4 cursor-pointer bg-slate-100 hover:bg-slate-300"
        >
          {language}
        </button>
      )}
      {largeLanguageModel && (
        <button
          onClick={() => handleClick('largeLanguageModel')}
          className="border border-black rounded-md text-xs px-4 cursor-pointer bg-slate-100 hover:bg-slate-300"
        >
          {largeLanguageModel}
        </button>
      )}
    </div>
  )
}
