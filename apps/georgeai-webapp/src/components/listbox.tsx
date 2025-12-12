import { Listbox as HuListbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { twMerge } from 'tailwind-merge'

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
      value={selectedItem ?? null}
      onChange={(newItem) => {
        onChange(newItem)
      }}
    >
      <ListboxButton
        disabled={disabled}
        aria-required={required}
        className={twMerge('grid w-full cursor-default grid-cols-1 focus:outline-primary', className)}
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
          className="col-start-1 row-start-1 size-5 self-center justify-self-end text-base-content/50 sm:size-4"
        />
      </ListboxButton>

      <ListboxOptions
        anchor="bottom"
        transition
        className="z-9999 mt-1 overflow-auto rounded-lg border bg-base-100 shadow-lg focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
      >
        {items.map((item) => (
          <ListboxOption
            key={item.id}
            value={item}
            className="group relative cursor-default p-2 pr-12 select-none data-focus:rounded-lg data-focus:bg-primary data-focus:text-primary-content"
          >
            <div className="flex items-center">
              <span className="ml-3 block truncate font-normal group-data-selected:font-semibold">{item.name}</span>
            </div>

            <span className="absolute inset-y-0 right-0 flex items-center pr-4 group-data-focus:text-primary-content group-[&:not([data-selected])]:hidden">
              <CheckIcon aria-hidden="true" className="size-5" />
            </span>
          </ListboxOption>
        ))}
      </ListboxOptions>
    </HuListbox>
  )
}
