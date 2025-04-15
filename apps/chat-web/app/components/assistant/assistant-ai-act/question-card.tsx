import { useRef, useState } from 'react'

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
  const { question, hint, options, onResponseChange, selected } = props
  const { t } = useTranslation()
  const [showNotes, setShowNotes] = useState((props.notes?.length || 0) > 0)
  const [notes, setNotes] = useState(props.notes)
  const [showPlaceholder, setShowPlaceholder] = useState(true)
  const editableDivRef = useRef<HTMLDivElement>(null)

  const handleResponseChange = (optionValue: string) => {
    onResponseChange(optionValue, notes)
  }

  const handleInput = () => {
    if (editableDivRef.current) {
      const text = editableDivRef.current.innerText
      setNotes(text)
      setShowPlaceholder(text.length === 0)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleInput()
    }
  }

  const handleFocus = () => {
    setShowPlaceholder(false)
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
          <label key={option.value} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={selected === option.value}
              onChange={() => {
                handleResponseChange(option.value)
              }}
              className="radio-info radio radio-xs"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>

      {showNotes && (
        <div className="relative">
          <div
            ref={editableDivRef}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            contentEditable={true}
            role="textbox"
            aria-multiline="true"
            className="textarea textarea-info focus:outline-none"
            onBlur={() => handleResponseChange(selected!)}
          />
          {showPlaceholder && (
            <div className="test-base-content pointer-events-none absolute left-4 top-3 text-sm opacity-50">
              {t('assistants.placeholders.euAiActNotePlaceholder')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default QuestionCard
