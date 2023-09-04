'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

interface FilterCheckboxProps {
  value: string
  checked: boolean
  filter: string
  valueArray: string[]
}

export const FilterCheckbox = ({
  value,
  checked,
  filter,
  valueArray,
}: FilterCheckboxProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParameters = useSearchParams()!

  const handleFilterChange = () => {
    const updatedParameters = new URLSearchParams(searchParameters.toString())

    if (checked) {
      updatedParameters.delete(filter, value)
      valueArray.map((item) => {
        if (item !== value) {
          updatedParameters.append(filter, item)
        }
      })
    } else {
      // updatedParameters.set(filter, value)
      updatedParameters.append(filter, value)
    }

    router.replace(pathname + '?' + updatedParameters.toString())
  }

  return (
    <label
      htmlFor={`${value}-checkbox`}
      className="cursor-pointer flex gap-0.5"
    >
      <input
        type="checkbox"
        value={value}
        checked={checked}
        onChange={handleFilterChange}
        id={`${value}-checkbox`}
        className="cursor-pointer"
      />
      {value}
    </label>
  )
}
