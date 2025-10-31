import { useEffect, useState } from 'react'

import { formatDuration } from '@george-ai/web-utils'

export const StopWatch = ({ start, refreshMs, format }: { start: Date; refreshMs: number; format: 'text' | 'lcd' }) => {
  const [elapsedTime, setElapsedTime] = useState(Date.now() - start.getTime())

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - start.getTime())
    }, refreshMs)
    return () => clearInterval(interval)
  }, [start, refreshMs])

  if (format === 'text') {
    return <span className="w-10 font-mono">{formatDuration(elapsedTime)}</span>
  }

  const milliseconds = elapsedTime % 1000
  const seconds = Math.floor((elapsedTime / 1000) % 60)
  const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60)

  // I need the format MM:SS.mmm
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`

  return <div className="font-mono">{formatted}</div>
}
