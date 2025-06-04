import { RefObject } from 'react'
import { createPortal } from 'react-dom'
import { twMerge } from 'tailwind-merge'

import { useTranslation } from '../i18n/use-translation-hook'

export interface DialogFormProps {
  ref?: RefObject<HTMLDialogElement | null>
  title: string
  description?: React.ReactNode
  onSubmit: (data: FormData) => void
  children?: React.ReactNode
  disabledSubmit?: boolean
  submitButtonText?: string
  submitButtonTooltipText?: string
  className?: string
  buttonOptions?: 'onlyClose' | 'cancelAndConfirm'
  open?: boolean
  onClose?: () => void
}

export const DialogForm = ({
  ref,
  title,
  description,
  onSubmit,
  children,
  disabledSubmit,
  submitButtonText,
  submitButtonTooltipText,
  className,
  buttonOptions = 'cancelAndConfirm',
  open,
  onClose = () => ref?.current?.close(),
}: DialogFormProps) => {
  const { t } = useTranslation()
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    onSubmit(formData)
  }

  const handleClose = () => {
    onClose()
  }

  // using react portals prevents animation issues with the modal
  return createPortal(
    <dialog className="modal" ref={ref} open={open}>
      <div className={twMerge('modal-box flex flex-col', className)}>
        <h3 className="text-lg font-bold">{title}</h3>
        {!!description && <p className="py-4">{description}</p>}
        <form method="dialog" onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2">{children}</div>
          <div className="modal-action flex justify-end gap-2">
            {buttonOptions === 'onlyClose' ? (
              <button type="button" className="btn btn-primary btn-sm" onClick={handleClose}>
                {submitButtonText || t('actions.close')}
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
    </dialog>,
    document.body,
  )
}
