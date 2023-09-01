'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

interface FilterCheckboxProps {
  value: string
  checked: boolean
  filter: string
}

export const FilterCheckbox: React.FC<FilterCheckboxProps> = ({
  value,
  checked,
  filter,
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParameters = useSearchParams()!

  const handleFilterChange = () => {
    const updatedParameters = new URLSearchParams(searchParameters.toString())

    if (checked) {
      updatedParameters.delete(filter)
    } else {
      updatedParameters.set(filter, value)
    }

    router.replace(pathname + '?' + updatedParameters.toString())
  }

  return (
    <div className="flex gap-0.5">
      <input
        type="checkbox"
        value={value}
        checked={checked}
        onChange={handleFilterChange}
        id={`${value}-checkbox`}
        className="cursor-pointer"
      />
      <label htmlFor={`${value}-checkbox`} className="cursor-pointer">
        {value}
      </label>
    </div>
  )
}
