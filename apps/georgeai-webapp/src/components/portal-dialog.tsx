import { RefObject, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { twMerge } from 'tailwind-merge'

export interface PortalDialogProps {
  ref: RefObject<HTMLDialogElement | null>
  children: React.ReactNode
  className?: string
  onClose?: () => void
}

/**
 * A dialog component that renders via React Portal to document.body.
 *
 * Use this when a dialog needs to escape parent positioning context,
 * such as when rendered inside menus, dropdowns, or other positioned elements.
 *
 * @example
 * ```tsx
 * const dialogRef = useRef<HTMLDialogElement>(null)
 *
 * <button onClick={() => dialogRef.current?.showModal()}>Open</button>
 *
 * <PortalDialog ref={dialogRef} onClose={() => dialogRef.current?.close()}>
 *   <h3>Dialog Title</h3>
 *   <p>Content here</p>
 * </PortalDialog>
 * ```
 */
export const PortalDialog = ({ ref, children, className, onClose }: PortalDialogProps) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setMounted(true)
    }, 0)
    return () => clearTimeout(timeoutId)
  }, [])

  const handleClose = () => {
    ref.current?.close()
    onClose?.()
  }

  const dialog = (
    <dialog className="modal" ref={ref}>
      <div className={twMerge('modal-box', className)}>{children}</div>
      <form method="dialog" className="modal-backdrop" onClick={handleClose}>
        <button type="button" onClick={handleClose}>
          Close
        </button>
      </form>
    </dialog>
  )

  // Only render portal on client side after mount
  if (!mounted || typeof document === 'undefined') {
    return null
  }

  return createPortal(dialog, document.body)
}
