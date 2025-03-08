import { twMerge } from 'tailwind-merge'

interface InputProps {
  name: string
  label: string
  value?: string | number | undefined | null
  type?: 'text' | 'email' | 'password' | 'number'
  placeholder?: string
  required?: boolean
  readOnly?: boolean
  className?: string
}

export const Input = ({ name, label, value, type, placeholder, required, readOnly, className }: InputProps) => {
  return (
    <label className={twMerge('flex w-full flex-col', className)}>
      <span className="text-sm text-slate-400">{label}</span>
      <input
        name={name}
        type={type || 'text'}
        defaultValue={value || ''}
        className={twMerge(
          'input input-bordered w-full',
          readOnly && 'cursor-not-allowed text-slate-400',
          type === 'number' && 'text-right',
        )}
        placeholder={placeholder || ''}
        required={required}
        readOnly={readOnly}
      />
    </label>
  )
}
