import { twMerge } from 'tailwind-merge'
import WarnIcon from '../icons/warn-icon'
import ErrorIcon from '../icons/error-icon'
import { JSX } from 'react'

export interface AlertProps {
  message: string
  type: 'warning' | 'error'
  className?: string
  children?: JSX.Element
}
const Alert = ({ message, type, className, children }: AlertProps) => {
  return (
    <div
      role="alert"
      className={twMerge(
        'alert',
        type === 'warning' && 'alert-warning',
        type === 'error' && 'alert-error',
        className,
      )}
    >
      {type === 'warning' && <WarnIcon className="h-5" />}
      {type === 'error' && <ErrorIcon className="h-5" />}
      <span>{message}</span>
      {children}
    </div>
  )
}

export default Alert
