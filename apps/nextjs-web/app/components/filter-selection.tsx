'use client'

import { PublicationState } from '@/src/gql/graphql'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export interface FilterSelectionProps {
  lang?: string
  status?: string
  llm?: string
}

export const FilterSelection = ({
  lang,
  status,
  llm,
}: FilterSelectionProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParameters = useSearchParams()!

  const handleFilterChange = (filter: string, value: string) => {
    const updatedParameter = new URLSearchParams(searchParameters.toString())

    if (value === lang || value === status || value === llm) {
      updatedParameter.delete(filter)
    } else {
      updatedParameter.set(filter, value)
    }

    router.replace(pathname + '?' + updatedParameter.toString())
  }

  return (
    <div className="flex justify-end gap-3">
      <div className="flex gap-0.5">
        <input
          type="checkbox"
          value={PublicationState.Draft}
          checked={status === 'draft'}
          onChange={() => handleFilterChange('status', 'draft')}
          id="draft-checkbox"
          className="cursor-pointer"
        />
        <label htmlFor="draft-checkbox" className="cursor-pointer">
          {PublicationState.Draft}
        </label>
      </div>
      <div className="flex gap-0.5">
        <input
          type="checkbox"
          value={PublicationState.Published}
          checked={status === 'published'}
          onChange={() => handleFilterChange('status', 'published')}
          id="published-checkbox"
          className="cursor-pointer"
        />
        <label htmlFor="published-checkbox" className="cursor-pointer">
          {PublicationState.Published}
        </label>
      </div>
      <div className="flex gap-0.5">
        <input
          type="checkbox"
          value="de"
          checked={lang === 'de'}
          onChange={() => handleFilterChange('lang', 'de')}
          id="de-checkbox"
          className="cursor-pointer"
        />
        <label htmlFor="de-checkbox" className="cursor-pointer">
          De
        </label>
      </div>
      <div className="flex gap-0.5">
        <input
          type="checkbox"
          value="en"
          checked={lang === 'en'}
          onChange={() => handleFilterChange('lang', 'en')}
          id="en-checkbox"
          className="cursor-pointer"
        />
        <label htmlFor="en-checkbox" className="cursor-pointer">
          En
        </label>
      </div>
      <div className="flex gap-0.5">
        <input
          type="checkbox"
          value="gpt-3.5-turbo"
          checked={llm === 'Gpt-3.5-turbo'}
          onChange={() => handleFilterChange('llm', 'Gpt-3.5-turbo')}
          id="gpt-3.5-turbo-checkbox"
          className="cursor-pointer"
        />
        <label htmlFor="gpt-3.5-turbo-checkbox" className="cursor-pointer">
          GPT-3.5-turbo
        </label>
      </div>
      <div className="flex cursor-pointer gap-0.5">
        <input
          type="checkbox"
          value="llama"
          checked={llm === 'llama'}
          onChange={() => handleFilterChange('llm', 'llama')}
          id="llama-checkbox"
          className="cursor-pointer"
        />
        <label htmlFor="llama-checkbox" className="cursor-pointer">
          LLAMA
        </label>
      </div>
    </div>
  )
}
