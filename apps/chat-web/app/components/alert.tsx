import { twMerge } from 'tailwind-merge'
import WarnIcon from './icons/warn-icon'
import ErrorIcon from './icons/error-icon'

export interface AlertProps {
  message: string
  type: 'warning' | 'error'
}
const Alert = ({ message, type }) => {
  return (
    <div
      role="alert"
      className={twMerge(
        'alert',
        type === 'warning' && 'alert-warning',
        type === 'error' && 'alert-error',
      )}
    >
      {type === 'warning' && <WarnIcon className="h-5" />}
      {type === 'error' && <ErrorIcon className="h-5" />}
      <span>{message}</span>
    </div>
  )
}

export default Alert
