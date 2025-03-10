import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { ZodRawShape, z } from 'zod'

interface InputProps<T extends ZodRawShape> {
  name: string
  label: string
  value?: string | number | undefined | null
  valueNotSet?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'date'
  placeholder?: string
  required?: boolean
  readOnly?: boolean
  schema?: z.ZodObject<T>
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  className?: string
}

export const Input = <T extends ZodRawShape>({
  name,
  label,
  value,
  valueNotSet,
  type,
  placeholder,
  required,
  readOnly,
  schema,
  onChange,
  onBlur,
  className,
}: InputProps<T>) => {
  const [errors, setErrors] = useState<string[]>([])
  const renderedType = type === 'date' ? 'text' : type
  const renderedValue = value ? value : valueNotSet

  const validate = (newValue: string) => {
    if (!schema) return
    const partialSchema = schema.partial()
    const parseResult = partialSchema.safeParse({ [name]: newValue })
    if (!parseResult.success) {
      setErrors(parseResult.error.errors.map((error) => error.message))
    } else {
      setErrors([])
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    validate(event.target.value)
    onChange?.(event)
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    validate(event.target.value)
    onBlur?.(event)
  }

  return (
    <label className={twMerge('grid w-full grid-cols-2', className)}>
      <span className={twMerge('text-sm text-slate-400', errors.length > 0 && 'text-error')}>{label}</span>
      <span className="justify-self-end text-sm text-error">{errors.join(', ')}</span>
      <input
        key={value}
        name={name}
        type={renderedType || 'text'}
        defaultValue={renderedValue || ''}
        className={twMerge(
          'input input-bordered col-span-2 w-full',
          readOnly && 'cursor-not-allowed text-slate-400',
          type === 'number' && 'text-right',
          type === 'date' && 'text-center',
        )}
        placeholder={placeholder || ''}
        required={required}
        readOnly={readOnly}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </label>
  )
}
