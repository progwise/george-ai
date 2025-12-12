import { useEffect, useState } from 'react'

export const useNow = (refreshDurationMs?: number) => {
  const [date, setDate] = useState<Date>(() => new Date())

  useEffect(() => {
    if (!refreshDurationMs) {
      return
    }
    const interval = setInterval(() => {
      setDate(new Date())
    }, refreshDurationMs && 1000)

    return () => clearInterval(interval)
  }, [refreshDurationMs])

  return { date, now: date.getTime() }
}
