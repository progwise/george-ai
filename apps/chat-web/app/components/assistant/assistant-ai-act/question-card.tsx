import { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { useTranslation } from '../../../i18n/use-translation-hook'

interface QuestionCardProps {
  question: string
  hint?: string
  options: { value: string; label: string }[]
  selected?: string | null
  notes?: string | null
  onResponseChange: (value?: string | null, notes?: string | null) => void
}

const QuestionCard = (props: QuestionCardProps) => {
  const { t } = useTranslation()
  const { question, hint, options, onResponseChange, selected } = props
  const [showNotes, setShowNotes] = useState((props.notes?.length || 0) > 0)
  const [notes, setNotes] = useState(props.notes === null ? '' : props.notes)
  const editableDivRef = useRef<HTMLDivElement>(null)

  const handleResponseChange = (optionValue: string) => {
    const sanitizedNotes = !notes ? notes : notes.trim()
    onResponseChange(optionValue, sanitizedNotes)
  }

  useEffect(() => {
    if (!editableDivRef.current || !props.notes) return
    editableDivRef.current.innerText = props.notes || ''
  }, [props.notes])

  const handleInput = () => {
    if (editableDivRef.current) {
      const text = editableDivRef.current.innerText
      setNotes(text)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleInput()
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {question}{' '}
          {hint && (
            <div className="tooltip cursor-help" data-tip={hint}>
              ℹ️
            </div>
          )}
        </span>

        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className="btn btn-ghost no-animation btn-sm w-min"
        >
          {showNotes ? t('actions.hideNotes') : t('actions.addNotes')}
        </button>
      </div>

      <div className="flex gap-3">
        {options.map((option) => (
          <label key={option.value} className="flex items-center text-sm">
            <input
              type="radio"
              checked={selected === option.value}
              onChange={() => {
                handleResponseChange(option.value)
              }}
              className="radio-info radio radio-xs"
            />
            <span className="ml-1">{option.label}</span>
          </label>
        ))}
      </div>

      <div className="relative">
        <div
          ref={editableDivRef}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          contentEditable={true}
          role="textbox"
          aria-multiline="true"
          className={twMerge('textarea textarea-info focus:outline-none', showNotes ? 'block' : 'hidden')}
          onBlur={() => handleResponseChange(selected!)}
          onFocus={({ currentTarget }) => {
            currentTarget.innerText = notes ? notes.trim() : ''
            const selection = window.getSelection()
            selection?.selectAllChildren(currentTarget)
            selection?.collapseToEnd()
          }}
        />

        {showNotes && (!notes || notes.length < 1) && (
          <div className="test-base-content pointer-events-none absolute left-4 top-3 text-sm opacity-50">
            {t('assistants.placeholders.euAiActNotePlaceholder')}
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestionCard
