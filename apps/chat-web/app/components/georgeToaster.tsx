/* eslint-disable @eslint-react/dom/no-dangerously-set-innerhtml */
import { JSX } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { twMerge } from 'tailwind-merge'

import { CheckIcon } from '../icons/check-icon'
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

const defaultAlertClasses = 'alert w-auto cursor-pointer animate-fade animate-delay-100'

export const toastError = (message: string | JSX.Element) => {
  return toast.custom(
    (t) => (
      <div className={twMerge(defaultAlertClasses, 'alert-error')} onClick={() => toast.remove(t.id)}>
        <ErrorIcon className="size-6" />
        {typeof message === 'string' ? <span>{message}</span> : message}
      </div>
    ),
    { ariaProps: { role: 'alert', 'aria-live': 'assertive' } },
  )
}

export const toastSuccess = (message: string | JSX.Element) => {
  return toast.custom((t) => (
    <div className={twMerge(defaultAlertClasses, 'alert-success')} onClick={() => toast.remove(t.id)}>
      <CheckIcon />
      {typeof message === 'string' ? <span>{message}</span> : message}
    </div>
  ))
}

export const toastWarning = (message: string | JSX.Element) => {
  return toast.custom((t) => (
    <div className={twMerge(defaultAlertClasses, 'alert-warning')} onClick={() => toast.remove(t.id)}>
      <CheckIcon />
      {typeof message === 'string' ? <span>{message}</span> : message}
    </div>
  ))
}
