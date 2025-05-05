import toast, { Toaster } from 'react-hot-toast'
import { twMerge } from 'tailwind-merge'

import { CheckIcon } from '../icons/check-icon'
import ErrorIcon from '../icons/error-icon'

const toastContainerClasses = 'pointer-events-auto flex w-fit rounded-lg bg-base-100 shadow-lg ring-1 ring-base-300'
const defaultAlertClasses =
  'alert flex flex-1 w-full cursor-pointer items-center gap-1 py-2 px-4 text-sm rounded-l-lg rounded-r-none'
const toastButtonClasses =
  'hover:text-primary-focus flex items-center justify-center rounded-r-lg border-l border-base-300 p-2 text-sm font-medium text-primary hover:bg-base-300'

const ToastContent = ({
  icon: Icon,
  message,
  type,
  onClose,
}: {
  icon: React.ElementType
  message: string
  type: 'alert-error' | 'alert-success'
  onClose: () => void
}) => (
  <div className={toastContainerClasses}>
    <div className={twMerge(defaultAlertClasses, type)}>
      <Icon className="size-5 flex-shrink-0" />
      <p className="ml-3 flex-1 text-sm">{message}</p>
    </div>
    <button type="button" className={toastButtonClasses} onClick={onClose}>
      Close
    </button>
  </div>
)

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

export const toastError = (message: string) => {
  return toast.custom((toastInstance) => (
    <ToastContent
      icon={ErrorIcon}
      message={message}
      type="alert-error"
      onClose={() => toast.remove(toastInstance.id)}
    />
  ))
}

export const toastSuccess = (message: string) => {
  return toast.custom((toastInstance) => (
    <ToastContent
      icon={CheckIcon}
      message={message}
      type="alert-success"
      onClose={() => toast.remove(toastInstance.id)}
    />
  ))
}
