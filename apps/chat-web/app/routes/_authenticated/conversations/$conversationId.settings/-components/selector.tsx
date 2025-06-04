import { FloatingPortal, size, useFloating } from '@floating-ui/react'
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { useState } from 'react'

interface SelectorProps<TOption> {
  options: TOption[] | ((query: string) => TOption[])
  onSelect: (assistant: TOption) => void
  disabled: boolean
  compareOption: (assistant: TOption, query: string) => boolean
  getKey: (option: TOption) => string
  getLabel: (option: TOption) => string
  notFoundLabel?: string
  inputPlaceholder?: string
}

export const Selector = <TOption,>({
  options,
  onSelect,
  disabled,
  compareOption,
  getKey,
  getLabel,
  notFoundLabel,
  inputPlaceholder = 'Search...',
}: SelectorProps<TOption>) => {
  const [query, setQuery] = useState('')
  const { refs, floatingStyles } = useFloating({
    strategy: 'fixed',
    placement: 'bottom-start',
    middleware: [
      // see https://floating-ui.com/docs/size#match-reference-width
      size({
        // @ts-expect-error // `apply` is not typed correctly in the library
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            minWidth: `${rects.reference.width}px`,
          })
        },
      }),
    ],
  })

  const allOptions = typeof options === 'function' ? options(query) : options
  const filteredOptions = allOptions.filter((option) => compareOption(option, query))

  const handleChange = (option: TOption | null) => {
    if (option) {
      onSelect?.(option)
      setQuery('')
    }
  }

  return (
    <Combobox<TOption> onChange={handleChange}>
      {/* Hack to open Combobox on click, see https://github.com/tailwindlabs/headlessui/discussions/1205#discussioncomment-3077117*/}
      <ComboboxButton className="w-full">
        <ComboboxInput
          onChange={(event) => setQuery(event.target.value)}
          value={query}
          className="input w-full"
          placeholder={inputPlaceholder}
          ref={refs.setReference}
          disabled={disabled}
        />
      </ComboboxButton>
      <FloatingPortal>
        <ComboboxOptions
          className="bg-base-100 border-base-300 rounded-field z-[1000] overflow-visible border p-1 shadow empty:hidden"
          style={floatingStyles}
          ref={refs.setFloating}
        >
          {filteredOptions.map((option) => (
            <ComboboxOption
              key={getKey(option)}
              value={option}
              className="data-focus:bg-primary data-focus:text-primary-content rounded-field cursor-pointer px-2 py-1"
            >
              {getLabel(option)}
            </ComboboxOption>
          ))}
          {filteredOptions.length === 0 && notFoundLabel && <div className="p-1 italic">{notFoundLabel}</div>}
        </ComboboxOptions>
      </FloatingPortal>
    </Combobox>
  )
}
