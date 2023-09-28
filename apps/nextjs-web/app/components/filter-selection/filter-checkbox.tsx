'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface FilterCheckboxProps {
  value: string
  checked: boolean
  filter: string
}

export const FilterCheckbox = ({
  value,
  checked,
  filter,
}: FilterCheckboxProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParameters = useSearchParams()

  const handleFilterChange = () => {
    const updatedParameters = new URLSearchParams(searchParameters.toString())

    if (checked) {
      updatedParameters.delete(filter)

      for (const item of searchParameters.getAll(filter)) {
        if (item !== value) {
          updatedParameters.append(filter, item)
        }
      }
    } else {
      updatedParameters.append(filter, value)
    }

    router.replace(pathname + '?' + updatedParameters.toString(), {
      scroll: false,
    })
  }

  return (
    <label className="cursor-pointer flex gap-0.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleFilterChange}
        className="cursor-pointer"
      />
      {value}
    </label>
  )
}
