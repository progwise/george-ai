import { useState } from 'react'

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
  const [showNotes, setShowNotes] = useState((props.notes?.length || 0) > 0)
  const [notes, setNotes] = useState(props.notes)
  const handleResponseChange = (optionValue: string) => {
    onResponseChange(optionValue, notes)
  }

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <span className="text-sm font-medium text-gray-700">{question}</span>
            {hint && (
              <div className="group relative ml-1">
                <span className="cursor-help text-xs text-gray-400">ℹ️</span>
                <div className="invisible absolute left-0 z-10 mt-1 w-64 rounded bg-gray-800 p-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100">
                  {hint}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-800"
          >
            {showNotes ? 'Notizen verbergen' : 'Notizen hinzufügen'}
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          {options.map((option) => (
            <label key={option.value} className="inline-flex items-center text-sm">
              <input
                type="radio"
                checked={selected === option.value}
                onChange={() => {
                  handleResponseChange(option.value)
                }}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>

        {/* Notes field */}
        {showNotes && (
          <div className="mt-2">
            <textarea
              value={notes ?? ''}
              placeholder="Zusätzliche Informationen oder Kontext..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={2}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => handleResponseChange(selected!)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestionCard
