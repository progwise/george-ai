import { useState } from 'react'
import { z } from 'zod'

import { useTranslation } from '../../i18n/use-translation-hook'
import { CrossIcon } from '../../icons/cross-icon'
import { PlusIcon } from '../../icons/plus-icon'

const emailSchema = z.string().email()

interface EmailChipsInputProps {
  emails: string[]
  setEmails: (emails: string[]) => void
  placeholder?: string
}

export const EmailChipsInput = ({ emails, setEmails, placeholder }: EmailChipsInputProps) => {
  const { t } = useTranslation()
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleAddEmail = () => {
    const trimmedValue = inputValue.trim()
    if (!trimmedValue) return

    const isValid = emailSchema.safeParse(trimmedValue).success
    if (!isValid) {
      setError(t('errors.invalidEmail'))
      return
    }

    if (!emails.includes(trimmedValue)) {
      setEmails([...emails, trimmedValue])
    }
    setInputValue('')
    setError(null)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      handleAddEmail()
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <input
          name="emailInput"
          type="text"
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.currentTarget.value)
            if (error) setError(null)
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input input-sm w-full flex-grow leading-normal"
        />
        <button type="button" className="btn btn-ghost btn-sm border-base-content/20" onClick={handleAddEmail}>
          <PlusIcon />
        </button>
      </div>
      {error && <p className="text-error text-sm">{error}</p>}
      <div
        className={`flex max-h-32 flex-wrap items-center gap-1 overflow-auto rounded-md ${emails.length > 0 && 'border-base-300 bg-base-100 border p-1'}`}
      >
        {emails.map((email) => (
          <div key={email} className="bg-base-300 flex w-full items-center gap-1 rounded-full px-2 py-0.5 text-sm">
            <span className="flex-1 truncate font-normal">{email}</span>
            <button
              type="button"
              className="hover:text-primary-focus btn btn-circle btn-ghost btn-xs"
              onClick={() => setEmails(emails.filter((event) => event !== email))}
            >
              <CrossIcon />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
