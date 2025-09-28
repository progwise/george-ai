import { SetStateAction, useEffect, useState } from 'react'

import { useQueryState } from './use-query-state'

const getFromLocalStorage = <T>(key: string) => {
  const saved = localStorage.getItem(key)
  if (saved) {
    return JSON.parse(saved) as T
  }
  return null
}

export const useLocalstorage = <T>(key: string) => {
  const [internalValue, setInternalValue] = useQueryState<T>(key)

  const [hasLoaded, setHasLoaded] = useState(false)

  // Load from localStorage after hydration to avoid SSR mismatch
  useEffect(() => {
    if (hasLoaded) return // Only load once

    const timeoutId = setTimeout(() => {
      const existingValue = getFromLocalStorage<T>(key)
      if (existingValue) {
        setInternalValue(existingValue)
      }
      setHasLoaded(true)
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [key, hasLoaded, setInternalValue])

  const setValue = (newValue: SetStateAction<T | null>) => {
    const prev = hasLoaded ? internalValue : getFromLocalStorage<T>(key)
    const actualValue =
      typeof newValue === 'function' ? (newValue as (prevState: T | null) => T | null)(prev) : newValue
    setInternalValue(actualValue)
    localStorage.setItem(key, JSON.stringify(actualValue, null, 2))
  }

  return [internalValue, setValue] as const
}
