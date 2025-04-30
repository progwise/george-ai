import { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

export interface EditableDivProps {
  onSubmit?: () => void
  onChange?: (value: string) => void
  onBlur?: (value: string) => void
  disabled: boolean
  value: string
  placeholder?: string
  className?: string
  placeholderClassName?: string
}

export const EditableDiv = ({
  onSubmit,
  onChange,
  onBlur,
  disabled,
  value,
  placeholder,
  className,
  placeholderClassName,
}: EditableDivProps) => {
  const editableDivRef = useRef<HTMLDivElement>(null)
  const [showPlaceholder, setShowPlaceholder] = useState(value.length === 0)

  useEffect(() => {
    if (!editableDivRef.current) return

    if (value === '' && editableDivRef.current.innerText !== '') {
      editableDivRef.current.innerText = ''
      // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
      setShowPlaceholder(true)
    } else if (value !== '' && editableDivRef.current.innerText !== value) {
      editableDivRef.current.innerText = value.trim()
      // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
      setShowPlaceholder(false)
    }
  }, [value])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSubmit?.()
    }
  }

  const handleInput = () => {
    if (editableDivRef.current) {
      const text = editableDivRef.current.innerText
      onChange?.(text)
      setShowPlaceholder(text.length === 0)
    }
  }

  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    if (showPlaceholder) {
      setShowPlaceholder(false)
    }

    // set the cursor to the end of the text
    const selection = window.getSelection()
    selection?.selectAllChildren(event.currentTarget)
    selection?.collapseToEnd()
  }

  const handleBlur = () => {
    if (!editableDivRef.current) return
    if (editableDivRef.current.innerText.trim() === '') {
      setShowPlaceholder(true)
    }
    const text = editableDivRef.current.innerText
    onBlur?.(text)
  }

  return (
    <div className="relative w-full">
      <div
        ref={editableDivRef}
        contentEditable={!disabled && 'plaintext-only'}
        className={className}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        role="textbox"
        aria-multiline="true"
        aria-disabled={!!disabled}
      />
      {showPlaceholder && placeholder && (
        <div
          className={twMerge(
            'text-base-content pointer-events-none absolute left-2 top-2 opacity-50',
            placeholderClassName,
          )}
        >
          {placeholder}
        </div>
      )}
    </div>
  )
}
