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
          className="bg-base-100 focus:outline-primary grid w-full cursor-default grid-cols-1 rounded-lg border px-2 py-1 text-sm focus:outline focus:outline-2"
        >
          <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
            {selectedItem ? (
              <span className="block truncate">{selectedItem.name}</span>
            ) : (
              <span className="text-base-content/50 block truncate">{placeholder}</span>
            )}
          </span>
          <ChevronUpDownIcon
            aria-hidden="true"
            className="text-base-content/50 col-start-1 row-start-1 size-5 self-center justify-self-end sm:size-4"
          />
        </ListboxButton>

        <ListboxOptions
          anchor="bottom"
          transition
          className="focus:outline-hidden bg-base-100 z-10 mt-1 overflow-auto rounded-lg border shadow-lg data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
        >
          {items.map((item) => (
            <ListboxOption
              key={item.id}
              value={item}
              className="data-[focus]:bg-primary data-[focus]:text-primary-content group relative cursor-default select-none p-2 pr-12 data-[focus]:rounded-lg"
            >
              <div className="flex items-center">
                <span className="ml-3 block truncate font-normal group-data-[selected]:font-semibold">{item.name}</span>
              </div>

              <span className="group-data-[focus]:text-primary-content absolute inset-y-0 right-0 flex items-center pr-4 group-[&:not([data-selected])]:hidden">
                <CheckIcon aria-hidden="true" className="size-5" />
              </span>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </HuListbox>
  )
}
