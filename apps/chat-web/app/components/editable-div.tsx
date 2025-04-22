import { useEffect, useRef, useState } from 'react'

export interface EditableDivProps {
  onSubmit: () => void
  onChange: (value: string) => void
  disabled: boolean
  value: string
  placeholder?: string
}

export const EditableDiv = ({ onSubmit, onChange, disabled, value, placeholder }: EditableDivProps) => {
  const editableDivRef = useRef<HTMLDivElement>(null)
  const [showPlaceholder, setShowPlaceholder] = useState(value.length === 0)

  useEffect(() => {
    if (editableDivRef.current) {
      if (value === '' && editableDivRef.current.innerText !== '') {
        editableDivRef.current.innerText = ''
        // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
        setShowPlaceholder(true)
      }
    }
  }, [value])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSubmit()
    }
  }

  const handleInput = () => {
    if (editableDivRef.current) {
      const text = editableDivRef.current.innerText
      onChange(text)
      setShowPlaceholder(text.length === 0)
    }
  }

  const handleFocus = () => {
    if (showPlaceholder) {
      setShowPlaceholder(false)
    }
  }

  const handleBlur = () => {
    if (editableDivRef.current && editableDivRef.current.innerText.trim() === '') {
      setShowPlaceholder(true)
    }
  }

  return (
    <div className="relative w-full">
      <div
        ref={editableDivRef}
        contentEditable={!disabled && 'plaintext-only'}
        className="max-h-[10rem] min-h-[3rem] overflow-y-auto rounded-md p-2 focus:border-primary focus:outline-none"
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        role="textbox"
        aria-multiline="true"
        aria-disabled={!!disabled}
      />
      {showPlaceholder && placeholder && (
        <div className="pointer-events-none absolute left-2 top-2 text-base-content opacity-50">{placeholder}</div>
      )}
    </div>
  )
}
