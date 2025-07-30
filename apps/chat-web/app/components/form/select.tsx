import { useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { ZodRawShape, z } from 'zod'

import { Listbox } from '../listbox'

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
  required,
  label,
  name,
  schema,
  placeholder,
}: SelectProps<T>) => {
  const hiddenIdFieldRef = useRef<HTMLInputElement>(null)
  const [errors, setErrors] = useState<string[]>([])

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
    validate(selectedOption?.id)
    hiddenIdFieldRef.current!.value = selectedOption?.id || ''
    onBlur?.(selectedOption)
  }
  return (
    <fieldset className={twMerge('fieldset group', className)}>
      <legend className="fieldset-legend flex w-full justify-between">
        <span className="group-has-aria-invalid:text-error text-sm">{label}</span>
        <span className="text-error">{errors.join(', ')}</span>
        {required && <span className="text-error">*</span>}
      </legend>
      <div className="dropdown col-span-2">
        <input type="hidden" name={name} ref={hiddenIdFieldRef} value={value?.id || ''} />
        <Listbox
          disabled={disabled}
          required={required}
          items={options}
          selectedItem={value}
          onChange={(selectedOption) => {
            handleChange(selectedOption)
          }}
          placeholder={placeholder}
        />
      </div>
    </fieldset>
  )
}
