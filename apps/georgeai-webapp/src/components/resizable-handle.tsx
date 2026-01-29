import { useCallback, useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { useLocalstorage } from '../hooks/use-local-storage'

export interface ResizableHandleParams {
  containerRef: React.RefObject<HTMLDivElement | null>
  minSize: number
  maxSize: number
}

export function ResizableHandle({ containerRef, minSize, maxSize }: ResizableHandleParams) {
  const [isDragging, setIsDragging] = useState(false)
  const startPosRef = useRef(0)
  const startSizeRef = useRef(0)
  const [panelWidth, setPanelSize] = useLocalstorage<{ panelSize: number }>('resizableHandle-panelSize')

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true)
      startPosRef.current = e.clientX
      startSizeRef.current = containerRef.current?.offsetWidth || 0
    },
    [containerRef],
  )

  useEffect(() => {
    if (containerRef.current && panelWidth?.panelSize) {
      containerRef.current.style.width = `${panelWidth.panelSize}px`
    }
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const delta = e.clientX - startPosRef.current
      const panelSize = Math.max(minSize, Math.min(maxSize, startSizeRef.current - delta))
      containerRef.current.style.width = `${panelSize}px`

      setPanelSize({ panelSize })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [panelWidth, isDragging, setPanelSize, maxSize, minSize, containerRef])
  return (
    <div
      className={twMerge('absolute top-0 -left-2 h-full w-4 cursor-col-resize bg-transparent')}
      onMouseDown={handleMouseDown}
      aria-label="Resize panel"
    />
  )
}
