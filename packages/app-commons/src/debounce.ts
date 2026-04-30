interface DebouncedFunction<T extends unknown[]> {
  (...args: T): void
  cancel: () => void
}

export const debounce = <T extends unknown[]>(callback: (...args: T) => void, delay: number): DebouncedFunction<T> => {
  let timeoutTimer: ReturnType<typeof setTimeout> | undefined

  const debouncedFn = (...args: T) => {
    if (timeoutTimer) {
      clearTimeout(timeoutTimer)
    }

    timeoutTimer = setTimeout(() => {
      callback(...args)
      timeoutTimer = undefined
    }, delay)
  }

  debouncedFn.cancel = () => {
    if (timeoutTimer) {
      clearTimeout(timeoutTimer)
      timeoutTimer = undefined
    }
  }

  return debouncedFn
}
