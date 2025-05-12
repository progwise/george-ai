import { JSX } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { twMerge } from 'tailwind-merge'

import { useTranslation } from '../i18n/use-translation-hook'
import { CheckIcon } from '../icons/check-icon'
import ErrorIcon from '../icons/error-icon'

const ToastContent = ({
  icon: Icon,
  message,
  type,
  onClose,
}: {
  icon: React.ElementType
  message: string | JSX.Element
  type: 'alert-error' | 'alert-success' | 'alert-warning'
  onClose: () => void
}) => {
  const { t } = useTranslation()

  return (
    <div className={twMerge('alert flex w-fit rounded-lg py-0 pr-1 text-sm shadow-lg', type)} role="alert">
      <Icon className="size-5 flex-shrink-0" />
      <p className="flex-1">{message}</p>
      <button type="button" className="btn btn-outline btn-sm my-1" onClick={onClose}>
        {t('actions.close')}
      </button>
    </div>
  )
}

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

export const toastWarning = (message: string | JSX.Element) => {
  return toast.custom((toastInstance) => (
    <ToastContent
      icon={CheckIcon}
      message={message}
      type="alert-warning"
      onClose={() => toast.remove(toastInstance.id)}
    />
  ))
}

export const toastError = (message: string | JSX.Element) => {
  return toast.custom((toastInstance) => (
    <ToastContent
      icon={ErrorIcon}
      message={message}
      type="alert-error"
      onClose={() => toast.remove(toastInstance.id)}
    />
  ))
}

export const toastSuccess = (message: string | JSX.Element) => {
  return toast.custom((toastInstance) => (
    <ToastContent
      icon={CheckIcon}
      message={message}
      type="alert-success"
      onClose={() => toast.remove(toastInstance.id)}
    />
  ))
}
