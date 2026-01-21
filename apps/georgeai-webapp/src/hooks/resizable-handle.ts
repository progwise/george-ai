import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { useLocalstorage } from './use-local-storage'

export interface UseResizableHandleOptions {
  onResize?: (width: number) => void
  minWidth?: number
  maxWidth?: number
  direction?: 'horizontal' | 'vertical'
}

export function useResizableHandle(options: UseResizableHandleOptions = {}) {
  const { onResize, minWidth = 120, maxWidth = Infinity, direction = 'horizontal' } = options

  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startPosRef = useRef(0)
  const startSizeRef = useRef(0)
  const [sidePanelWidth, setSidePanelWidth] = useLocalstorage<{ panelWidth: number }>('resizableHandle-panelWidth')

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true)
      startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY
      startSizeRef.current =
        direction === 'horizontal' ? containerRef.current?.offsetWidth || 0 : containerRef.current?.offsetHeight || 0
    },
    [direction],
  )

  useLayoutEffect(() => {
    if (containerRef.current && sidePanelWidth?.panelWidth) {
      containerRef.current.style.width = `${sidePanelWidth.panelWidth}px`
    }
  }, [sidePanelWidth])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const delta = (direction === 'horizontal' ? e.clientX : e.clientY) - startPosRef.current
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startSizeRef.current - delta))

      if (direction === 'horizontal') {
        containerRef.current.style.width = `${newWidth}px`
      } else {
        containerRef.current.style.height = `${newWidth}px`
      }

      onResize?.(newWidth)
      setSidePanelWidth({ panelWidth: newWidth })
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
  }, [sidePanelWidth, isDragging, minWidth, maxWidth, direction, onResize, setSidePanelWidth])

  return {
    containerRef,
    handleMouseDown,
    isDragging,
  }
}
