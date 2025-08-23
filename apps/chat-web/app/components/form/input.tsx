import { useCallback, useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { ZodRawShape, z } from 'zod'

export type InputBlurEvent = React.FocusEvent<HTMLInputElement> | React.FocusEvent<HTMLTextAreaElement>
export type InputChangeEvent = React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
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
  readonly?: boolean
  schema?: z.ZodObject<T>
  onChange?: (event: InputChangeEvent) => void
  onBlur?: (event: InputBlurEvent) => void
  className?: string
  validateOnSchemaChange?: boolean // Allow validation on schema change even if not touched
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
  readonly,
  schema,
  onChange,
  onBlur,
  className,
  validateOnSchemaChange = false,
}: InputProps<T>) => {
  const [errors, setErrors] = useState<string[]>([])
  const [hasBeenTouched, setHasBeenTouched] = useState(false)
  const renderedType = type === 'date' ? 'text' : type
  const renderedValue = value ? value : valueNotSet
  const internalRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const isFirstRenderRef = useRef(true)

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
      setHasBeenTouched(true)
      validate(event.target.value)
      onChange?.(event)
    },
    [validate, onChange],
  )

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement> | React.FocusEvent<HTMLTextAreaElement>) => {
      setHasBeenTouched(true)
      if (event.target.value === renderedValue) return
      validate(event.target.value)
      onBlur?.(event)
    },
    [renderedValue, validate, onBlur],
  )

  // Validate when schema changes (but not on initial load)
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }

    if (schema && internalRef.current && (hasBeenTouched || validateOnSchemaChange)) {
      // Defer validation to avoid direct setState in useEffect
      const timeoutId = setTimeout(() => {
        validate(internalRef.current?.value || '')
      }, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [schema, validate, hasBeenTouched, validateOnSchemaChange])

  return (
    <fieldset className={twMerge('fieldset group', type === 'textarea' && 'flex flex-col', className)}>
      <legend className="fieldset-legend flex w-full justify-between">
        <span className={twMerge('group-has-aria-invalid:text-error', disabled && 'text-co')}>{label}</span>
        <span className="text-error">{errors.join(', ')}</span>
        {required && <span className="text-error">*</span>}
      </legend>

      {type === 'textarea' ? (
        <textarea
          id={name}
          ref={(el) => {
            internalRef.current = el
            if (ref) {
              if (typeof ref === 'function') ref(el)
              else ref.current = el
            }
          }}
          key={value}
          name={name}
          defaultValue={renderedValue || ''}
          className="input validator w-full flex-1 resize-none whitespace-pre-wrap break-words py-1 leading-normal"
          style={{ font: 'inherit' }}
          placeholder={placeholder || ''}
          required={required}
          disabled={disabled}
          readOnly={readonly}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={(e) => e.target.select()}
          aria-invalid={errors.length > 0 ? true : undefined}
        />
      ) : (
        <input
          id={name}
          ref={(el) => {
            internalRef.current = el
            if (ref) {
              if (typeof ref === 'function') ref(el)
              else ref.current = el
            }
          }}
          key={value}
          name={name}
          type={renderedType || 'text'}
          defaultValue={renderedValue || ''}
          className="input validator w-full"
          placeholder={placeholder || ''}
          required={required}
          disabled={disabled}
          readOnly={readonly}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={(e) => e.target.select()}
          aria-invalid={errors.length > 0 ? true : undefined}
        />
      )}
    </fieldset>
  )
}
