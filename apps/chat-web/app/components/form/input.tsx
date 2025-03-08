import { twMerge } from 'tailwind-merge'

interface InputProps {
  name: string
  label: string
  value?: string | number | undefined | null
  valueNotSet?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'date'
  placeholder?: string
  required?: boolean
  readOnly?: boolean
  className?: string
}

export const Input = ({
  name,
  label,
  value,
  valueNotSet,
  type,
  placeholder,
  required,
  readOnly,
  className,
}: InputProps) => {
  const renderedType = type === 'date' ? 'text' : type
  const renderedValue = value ? value : valueNotSet
  return (
    <label className={twMerge('flex w-full flex-col', className)}>
      <span className="text-sm text-slate-400">{label}</span>
      <input
        key={value}
        name={name}
        type={renderedType || 'text'}
        defaultValue={renderedValue || ''}
        className={twMerge(
          'input input-bordered w-full',
          readOnly && 'cursor-not-allowed text-slate-400',
          type === 'number' && 'text-right',
          type === 'date' && 'text-center',
        )}
        placeholder={placeholder || ''}
        required={required}
        readOnly={readOnly}
      />
    </label>
  )
}
