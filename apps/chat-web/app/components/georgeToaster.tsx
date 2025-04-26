import toast, { Toaster } from 'react-hot-toast'
import { twMerge } from 'tailwind-merge'

import { CheckIcon } from '../icons/check-icon'
import { CrossIcon } from '../icons/cross-icon'
import ErrorIcon from '../icons/error-icon'

export const GeorgeToaster = () => {
  return (
    <Toaster
      toastOptions={{
        duration: 20000,
        error: { ariaProps: { role: 'alert', 'aria-live': 'assertive' } },
        position: 'top-right',
        style: { zIndex: 1000 },
      }}
    />
  )
}
const defaultAlertClasses = 'alert flex w-auto cursor-pointer items-start gap-1 py-2 relative text-sm rounded-md'

export const toastError = (message: string) => {
  return toast.custom(
    (toastInstance) => (
      <div className={twMerge(defaultAlertClasses, 'alert-error')}>
        <ErrorIcon className="size-5" />
        <span className="break-words pr-4 text-sm">{message}</span>
        <button
          type="button"
          className="tooltip tooltip-left absolute right-0 top-0 m-1"
          data-tip="Close"
          onClick={() => toast.remove(toastInstance.id)}
        >
          <CrossIcon className="size-4" />
        </button>
      </div>
    ),
    { ariaProps: { role: 'alert', 'aria-live': 'assertive' } },
  )
}

export const toastSuccess = (message: string) => {
  return toast.custom((toastInstance) => (
    <div className={twMerge(defaultAlertClasses, 'alert-success')}>
      <CheckIcon className="size-5" />
      <span className="break-words pr-4 text-sm">{message}</span>
      <button
        type="button"
        className="tooltip tooltip-left absolute right-0 top-0 m-1"
        data-tip="Close"
        onClick={() => toast.remove(toastInstance.id)}
      >
        <CrossIcon className="size-4" />
      </button>
    </div>
  ))
}
