import { useState } from 'react'

import { graphql } from '../../../gql'
import { QuestionCard_QuestionFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { EditableDiv } from '../../editable-div'

graphql(`
  fragment QuestionCard_Question on AiActQuestion {
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
  question: QuestionCard_QuestionFragment
  onResponseChange: (value?: string | null, notes?: string | null) => void
}

const QuestionCard = ({ question, onResponseChange }: QuestionCardProps) => {
  const { t, language } = useTranslation()
  const { title, notes, value, hint, options } = question
  const [showNotes, setShowNotes] = useState((notes?.length || 0) > 0)

  const handleResponseChange = (optionValue?: string, notes?: string) => {
    const sanitizedNotes = !notes ? notes : notes.trim()
    onResponseChange(optionValue, sanitizedNotes)
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
          className="no-animation btn btn-ghost btn-sm w-min"
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
                handleResponseChange(option.id, notes ?? '')
              }}
              className="radio radio-info radio-xs"
            />
            <span className="ml-1">{option.title[language]}</span>
          </label>
        ))}
      </div>
      {showNotes && (
        <EditableDiv
          className="focus:outline-hidden textarea textarea-info"
          onBlur={(newNotes) => handleResponseChange(value ?? undefined, newNotes)}
          disabled={false}
          value={notes ?? ''}
          placeholder={t('assistants.placeholders.euAiActNotePlaceholder')}
          placeholderClassName="test-base-content pointer-events-none absolute left-4 top-3 text-sm opacity-50"
        />
      )}
    </div>
  )
}

export default QuestionCard
