import toast, { Toaster } from 'react-hot-toast'
import { twMerge } from 'tailwind-merge'

import ErrorIcon from '../icons/error-icon'

export const GeorgeToaster = () => {
  return (
    <Toaster
      toastOptions={{
        duration: 4000,
        error: { ariaProps: { role: 'alert', 'aria-live': 'assertive' } },
        position: 'top-right',
        style: { zIndex: 1000 },
      }}
    />
  )
}

const defaultAlertClasses = 'alert w-auto'

export const toastError = (message: string) => {
  toast.custom(
    <div className={twMerge(defaultAlertClasses, 'alert-error')}>
      <ErrorIcon className="size-6" />
      <span>{message}</span>
    </div>,
    { ariaProps: { role: 'alert', 'aria-live': 'assertive' } },
  )
}
export const toastSuccess = (message: string) => {
  toast.success(
    <div className={twMerge(defaultAlertClasses, 'alert-success')}>
      <span>{message}</span>
    </div>,
  )
}
