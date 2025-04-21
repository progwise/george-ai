import toast, { Toaster } from 'react-hot-toast'
import { twMerge } from 'tailwind-merge'

import { CheckIcon } from '../icons/check-icon'
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

const defaultAlertClasses = 'alert w-auto cursor-pointer text-sm'

export const toastError = (message: string) => {
  return toast.custom(
    (t) => (
      <div className={twMerge(defaultAlertClasses, 'alert-error')} onClick={() => toast.remove(t.id)}>
        <ErrorIcon className="size-5" />
        <span>{message}</span>
      </div>
    ),
    { ariaProps: { role: 'alert', 'aria-live': 'assertive' } },
  )
}

export const toastSuccess = (message: string) => {
  return toast.custom((t) => (
    <div className={twMerge(defaultAlertClasses, 'alert-success')} onClick={() => toast.remove(t.id)}>
      <CheckIcon className="size-5" />
      <span>{message}</span>
    </div>
  ))
}
