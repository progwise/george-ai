import { Listbox as HuListbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'

import { CheckIcon } from '../icons/check-icon'
import { ChevronUpDownIcon } from '../icons/chevron-up-down-icon'

interface ListboxProps<T> {
  items: T[]
  selectedItem: T | undefined | null
  onChange: (item: T | null) => void
  disabled?: boolean
  required?: boolean
  placeholder?: string
  className?: string
}

export const Listbox = <T extends { id: string; name: string }>({
  items,
  selectedItem,
  onChange,
  disabled,
  required,
  placeholder,
  className,
}: ListboxProps<T>) => {
  return (
    <HuListbox
      defaultValue={selectedItem}
      onChange={(newItem) => {
        onChange(newItem)
      }}
    >
      <div className={className}>
        <ListboxButton
          disabled={disabled}
          aria-required={required}
          className="grid w-full cursor-default grid-cols-1 rounded-lg bg-white py-1 pl-3 pr-2 text-left text-sm/6 text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
        >
          <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
            {selectedItem ? (
              <span className="block truncate">{selectedItem.name}</span>
            ) : (
              <span className="block truncate text-base-content/50">{placeholder}</span>
            )}
          </span>
          <ChevronUpDownIcon
            aria-hidden="true"
            className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
          />
        </ListboxButton>

        <ListboxOptions
          anchor="bottom"
          transition
          className="z-10 mt-1 overflow-auto rounded-lg bg-white text-base shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
        >
          {items.map((item) => (
            <ListboxOption
              key={item.id}
              value={item}
              className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:rounded-lg data-[focus]:bg-indigo-600 data-[focus]:text-white data-[focus]:outline-none"
            >
              <div className="flex items-center">
                <span className="ml-3 block truncate font-normal group-data-[selected]:font-semibold">{item.name}</span>
              </div>

              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-[&:not([data-selected])]:hidden group-data-[focus]:text-white">
                <CheckIcon aria-hidden="true" className="size-5" />
              </span>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </HuListbox>
  )
}
