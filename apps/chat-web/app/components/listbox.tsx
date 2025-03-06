import {
  Listbox as HuListbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react'
import { useState } from 'react'

import { CheckIcon } from '../icons/check-icon'
import { ChevronUpDownIcon } from '../icons/chevron-up-down-icon'

interface ListboxProps<T> {
  items: T[]
  selectedItem: T
  onChange: (item: T) => void
}

export const Listbox = <T extends { id: string; name: string }>({
  items,
  selectedItem,
  onChange,
}: ListboxProps<T>) => {
  const [selected, setSelected] = useState(selectedItem)

  return (
    <HuListbox
      value={selected}
      onChange={(newItem) => {
        setSelected(newItem)
        onChange(newItem)
      }}
    >
      <div className="relative mt-2 min-w-52">
        <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-box bg-white py-1.5 pl-3 pr-2 text-left text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
          <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
            <span className="block truncate">{selected.name}</span>
          </span>
          <ChevronUpDownIcon
            aria-hidden="true"
            className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
          />
        </ListboxButton>

        <ListboxOptions
          transition
          className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-box bg-white text-base shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
        >
          {items.map((item) => (
            <ListboxOption
              key={item.id}
              value={item}
              className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white data-[focus]:outline-none data-[focus]:rounded-box"
            >
              <div className="flex items-center">
                <span className="ml-3 block truncate font-normal group-data-[selected]:font-semibold">
                  {item.name}
                </span>
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
