import { useCallback, useEffect, useRef } from 'react'

interface ScrollObserverProps {
  onScroll: (isAtTop: boolean) => void
}

/**
 * ScrollObserver component that uses Intersection Observer API to detect
 * when the top of the page is visible or not.
 */
export const ScrollObserver = ({ onScroll }: ScrollObserverProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const isAtTop = entries.at(0)?.isIntersecting ?? false
      onScroll(isAtTop)
    },
    [onScroll],
  )

  useEffect(() => {
    if (scrollRef.current) {
      const observer = new IntersectionObserver(handleIntersection)
      observer.observe(scrollRef.current)

      return () => observer.disconnect()
    }
  }, [scrollRef, handleIntersection])

  return <div className="absolute left-0 top-0" ref={scrollRef} />
}
