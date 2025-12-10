import { useEffect, useMemo } from 'react'

import { debounce } from '@george-ai/web-utils'

interface LibraryQueryInputProps {
  libraryName: string
  onSearchTermChange: (newTerm: string) => void
  defaultSearchTerm?: string
}

export const LibraryQueryInput = ({ libraryName, onSearchTermChange, defaultSearchTerm }: LibraryQueryInputProps) => {
  const debounceInput = useMemo(
    () =>
      debounce((value: string) => {
        onSearchTermChange(value)
      }, 1000),
    [onSearchTermChange],
  )

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debounceInput.cancel()
    }
  }, [debounceInput])

  return (
    <fieldset className="fieldset grid items-center gap-4">
      <h3 className="self-center text-center text-lg">Library {libraryName}</h3>
      <label className="input m-auto">
        <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </g>
        </svg>
        <input
          key={`search-input-${libraryName}`}
          defaultValue={defaultSearchTerm}
          type="search"
          className="grow"
          placeholder="Search"
          onChange={(event) => {
            debounceInput(event.target.value)
          }}
        />
        <kbd className="kbd kbd-sm">⌘</kbd>
        <kbd className="kbd kbd-sm">S</kbd>
      </label>
    </fieldset>
  )
}
