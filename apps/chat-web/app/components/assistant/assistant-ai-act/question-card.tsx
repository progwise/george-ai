import { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { FragmentType, graphql, useFragment } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'

const QuestionCard_questionFragment = graphql(`
  fragment QuestionCard_question on AiActQuestion {
    id
    title {
      de
      en
    }
    notes
    value
    hint {
      de
      en
    }
    options {
      id
      title {
        de
        en
      }
    }
  }
`)

interface QuestionCardProps {
  question: FragmentType<typeof QuestionCard_questionFragment>
  onResponseChange: (value?: string | null, notes?: string | null) => void
}

const QuestionCard = (props: QuestionCardProps) => {
  const { t, language } = useTranslation()
  const question = useFragment(QuestionCard_questionFragment, props.question)
  const { title, notes, value, hint, options } = question
  const [showNotes, setShowNotes] = useState((notes?.length || 0) > 0)
  const [editedNotes, setEditedNotes] = useState(notes === null ? '' : notes)
  const editableDivRef = useRef<HTMLDivElement>(null)

  const handleResponseChange = (optionValue: string) => {
    const sanitizedNotes = !editedNotes ? editedNotes : editedNotes.trim()
    props.onResponseChange(optionValue, sanitizedNotes)
  }

  useEffect(() => {
    if (!editableDivRef.current || !notes) return
    editableDivRef.current.innerText = notes || ''
  }, [notes])

  const handleInput = () => {
    if (editableDivRef.current) {
      const text = editableDivRef.current.innerText
      setEditedNotes(text)
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
          {title[language]}{' '}
          {hint && (
            <div className="tooltip cursor-help" data-tip={hint[language]}>
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
          <label key={option.id} className="flex items-center text-sm">
            <input
              type="radio"
              checked={value === option.id}
              onChange={() => {
                handleResponseChange(option.id)
              }}
              className="radio-info radio radio-xs"
            />
            <span className="ml-1">{option.title[language]}</span>
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
          onBlur={() => handleResponseChange(value!)}
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
