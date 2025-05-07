import { useCallback, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { ZodRawShape, z } from 'zod'

interface InputProps<T extends ZodRawShape> {
  ref?: React.Ref<HTMLInputElement | HTMLTextAreaElement>
  name: string
  label: string
  value?: string | number | undefined | null
  valueNotSet?: string
  type?: 'text' | 'textarea' | 'email' | 'password' | 'number' | 'date'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  schema?: z.ZodObject<T>
  onChange?: (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement> | React.FocusEvent<HTMLTextAreaElement>) => void
  className?: string
}

export const Input = <T extends ZodRawShape>({
  ref,
  name,
  label,
  value,
  valueNotSet,
  type,
  placeholder,
  required,
  disabled,
  schema,
  onChange,
  onBlur,
  className,
}: InputProps<T>) => {
  const [errors, setErrors] = useState<string[]>([])
  const renderedType = type === 'date' ? 'text' : type
  const renderedValue = value ? value : valueNotSet

  const validate = useCallback(
    (newValue: string) => {
      if (!schema) return
      const partialSchema = schema.partial()
      const parseResult = partialSchema.safeParse({ [name]: newValue })
      if (!parseResult.success) {
        setErrors(parseResult.error.errors.map((error) => error.message))
      } else {
        setErrors([])
      }
    },
    [name, schema],
  )

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
      validate(event.target.value)
      onChange?.(event)
    },
    [validate, onChange],
  )

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement> | React.FocusEvent<HTMLTextAreaElement>) => {
      if (event.target.value === renderedValue) return
      validate(event.target.value)
      onBlur?.(event)
    },
    [renderedValue, validate, onBlur],
  )

  return (
    <fieldset className={twMerge('fieldset group', className)}>
      <legend className="fieldset-legend flex w-full justify-between">
        <span className="group-has-aria-invalid:text-error text-sm">{label}</span>
        <span className="text-error">{errors.join(', ')}</span>
      </legend>

      {type === 'textarea' ? (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          key={value}
          name={name}
          defaultValue={renderedValue || ''}
          className="input validator h-full w-full flex-grow py-1 leading-normal"
          placeholder={placeholder || ''}
          required={required}
          disabled={disabled}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={errors.length > 0 ? true : undefined}
        />
      ) : (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          key={value}
          name={name}
          type={renderedType || 'text'}
          defaultValue={renderedValue || ''}
          className="input validator w-full"
          placeholder={placeholder || ''}
          required={required}
          disabled={disabled}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={errors.length > 0 ? true : undefined}
        />
      )}
    </fieldset>
  )
}
