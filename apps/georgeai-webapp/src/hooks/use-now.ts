import { useEffect, useState } from 'react'

export const useNow = (refreshDurationMs?: number) => {
  const [date, setDate] = useState<Date | null>(null)

  useEffect(() => {
    const interval = setTimeout(() => {
      setDate(new Date())
    }, 0)

    return () => clearTimeout(interval)
  }, [])

  useEffect(() => {
    if (!refreshDurationMs) {
      return
    }
    const interval = setInterval(() => {
      setDate(new Date())
    }, refreshDurationMs)

    return () => clearInterval(interval)
  }, [refreshDurationMs])

  return { date, now: date ? date.getTime() : 0 }
}
