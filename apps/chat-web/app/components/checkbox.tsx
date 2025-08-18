import React, { useEffect, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

interface CheckboxProps {
  className?: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  checked: boolean | undefined
}

export const Checkbox = ({ checked, onChange, className }: CheckboxProps) => {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!ref.current) {
      return
    }
    ref.current.indeterminate = checked !== false && checked !== true
  }, [ref, checked])
  return (
    <input
      ref={ref}
      type="checkbox"
      className={twMerge('checkbox checkbox-xs', className)}
      onChange={onChange}
      checked={checked}
    />
  )
}
