import { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { ZodRawShape, z } from 'zod'

export interface SelectItem {
  id: string
  name: string
}

interface SelectProps<T extends ZodRawShape> {
  options: SelectItem[]
  value: SelectItem | undefined | null
  valueNotSet?: string
  className?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  label?: string
  name: string
  schema?: z.ZodObject<T>
  onBlur?: (selectedItem: SelectItem | null) => void
  placeholder?: string
}

export const Select = <T extends ZodRawShape>({
  options,
  value,
  onBlur,
  className,
  disabled,
  readonly,
  required,
  label,
  name,
  schema,
  placeholder,
}: SelectProps<T>) => {
  const hiddenInputRef = useRef<HTMLInputElement>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [selectedItem, setSelectedItem] = useState<SelectItem | null>(value || null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSelectedItem(value || null)
    }, 100)
    return () => clearTimeout(timeout)
  }, [value])

  const validate = (newValue: string | null | undefined) => {
    if (!schema) return
    const partialSchema = schema.partial()
    const parseResult = partialSchema.safeParse({ [name]: newValue })
    if (!parseResult.success) {
      setErrors(parseResult.error.errors.map((error) => error.message))
    } else {
      setErrors([])
    }
  }

  const handleChange = (selectedOption: SelectItem | null) => {
    const newValue = selectedOption?.id || ''
    setSelectedItem(selectedOption)
    // Update hidden input immediately before calling onBlur so FormData has correct value
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = newValue
    }
    validate(newValue)
    onBlur?.(selectedOption)
  }
  return (
    <fieldset className={twMerge('group z-50 fieldset', className)}>
      <legend className="fieldset-legend flex w-full justify-between">
        <span
          className={twMerge('group-has-aria-invalid:text-error', (disabled || readonly) && 'text-base-content/50')}
        >
          {label}
          {required && <span className="text-error"> *</span>}
        </span>
        <span className="text-error">{errors.join(', ')}</span>
      </legend>
      <div className="dropdown col-span-2">
        <input type="hidden" name={name} ref={hiddenInputRef} value={selectedItem?.id || ''} />
        <select
          value={selectedItem ? selectedItem.id : ''}
          className="select"
          onChange={(event) => {
            const selectedOption = options.find((option) => option.id === event.target.value) || null
            handleChange(selectedOption)
          }}
          aria-label={label}
          aria-placeholder={placeholder}
          disabled={disabled}
          aria-readonly={readonly}
          aria-required={required}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  )
}
