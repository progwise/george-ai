import { RefObject, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

import { useTranslation } from '../i18n/use-translation-hook'

export interface DialogFormProps {
  ref: RefObject<HTMLDialogElement | null>
  title: string
  description?: React.ReactNode
  onSubmit: (data: FormData) => void
  onClose?: () => void
  children?: React.ReactNode
  disabledSubmit?: boolean
  submitButtonText?: string
  submitButtonTooltipText?: string
  className?: string
  buttonOptions?: 'onlyClose' | 'cancelAndConfirm'
}

export const DialogForm = ({
  ref,
  title,
  description,
  onSubmit,
  onClose,
  children,
  disabledSubmit,
  submitButtonText,
  submitButtonTooltipText,
  className,
  buttonOptions = 'cancelAndConfirm',
}: DialogFormProps) => {
  const { t } = useTranslation()
  const formRef = useRef<HTMLFormElement | null>(null)
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    onSubmit(formData)
  }

  const handleClose = () => {
    // Prevent closing dialog during async operations (e.g., mutations, API calls)
    // to avoid crashes and data inconsistency. See issue #652.
    if (disabledSubmit) return

    ref.current?.close()
    formRef.current?.reset()
    onClose?.()
  }

  const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    // Prevent ESC key from closing dialog during async operations
    if (disabledSubmit) {
      event.preventDefault()
    } else {
      formRef.current?.reset()
      onClose?.()
    }
  }

  return (
    <dialog className="modal" ref={ref} onCancel={handleCancel}>
      <div className={twMerge('modal-box flex flex-col', className)}>
        <h3 className="text-lg font-bold">{title}</h3>
        {!!description && <p className="py-4">{description}</p>}
        <form ref={formRef} method="dialog" onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-auto">{children}</div>
          <div className="modal-action flex justify-end gap-2">
            {buttonOptions === 'onlyClose' ? (
              <button type="button" className="btn btn-primary btn-sm" onClick={handleClose}>
                {t('actions.close')}
              </button>
            ) : (
              <>
                <button type="button" className="btn btn-sm" onClick={handleClose}>
                  {t('actions.cancel')}
                </button>
                <div className={`${disabledSubmit ? 'tooltip tooltip-left' : ''}`} data-tip={submitButtonTooltipText}>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={disabledSubmit}>
                    {submitButtonText || t('actions.confirm')}
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={handleClose}>
        <button type="button" onClick={handleClose}>
          Close
        </button>
      </form>
    </dialog>
  )
}
