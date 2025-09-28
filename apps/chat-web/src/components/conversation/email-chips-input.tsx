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
    <>
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
      <div className="rounded-box border-base-300 flex flex-col gap-1 overflow-y-auto border p-1 empty:hidden">
        {emails.map((email) => (
          <div key={email} className="bg-base-300 rounded-field flex items-center gap-1 px-2 py-0.5 text-sm">
            <span className="flex-1 truncate">{email}</span>
            <button
              type="button"
              className="btn btn-circle btn-ghost btn-xs"
              onClick={() => setEmails(emails.filter((event) => event !== email))}
            >
              <CrossIcon />
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
