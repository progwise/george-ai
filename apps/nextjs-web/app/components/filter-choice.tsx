'use client'

import { PublicationState } from '@/src/gql/graphql'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export const FilterChoice = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParameters = useSearchParams()!

  const handleClick = (filter: string, value: string) => {
    const updatedParameter = new URLSearchParams(searchParameters.toString())

    updatedParameter.set(filter, value)

    router.replace(pathname + '?' + updatedParameter.toString())
  }

  return (
    <div>
      <button
        onClick={() => handleClick('status', PublicationState.Draft)}
        className="border border-black rounded-md text-xs px-4 cursor-pointer bg-slate-100 hover:bg-slate-300"
      >
        {PublicationState.Draft}
      </button>
      <button
        onClick={() => handleClick('status', PublicationState.Published)}
        className="border border-black rounded-md text-xs px-4 cursor-pointer bg-slate-100 hover:bg-slate-300"
      >
        {PublicationState.Published}
      </button>
      <button
        onClick={() => handleClick('language', 'de')}
        className="border border-black rounded-md text-xs px-4 cursor-pointer bg-slate-100 hover:bg-slate-300"
      >
        De
      </button>
      <button
        onClick={() => handleClick('language', 'en')}
        className="border border-black rounded-md text-xs px-4 cursor-pointer bg-slate-100 hover:bg-slate-300"
      >
        En
      </button>
      <button
        onClick={() => handleClick('largeLanguageModel', 'gpt-3.5-turbo')}
        className="border border-black rounded-md text-xs px-4 cursor-pointer bg-slate-100 hover:bg-slate-300"
      >
        gpt-3.5-turbo
      </button>
      <button
        onClick={() => handleClick('largeLanguageModel', 'llama')}
        className="border border-black rounded-md text-xs px-4 cursor-pointer bg-slate-100 hover:bg-slate-300"
      >
        llama
      </button>
    </div>
  )
}
